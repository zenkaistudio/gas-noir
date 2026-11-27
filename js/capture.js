/* ============================================
   GAS NOIR — Lead capture
   Sends booking / contact requests to our own Supabase table.
   A request is banked on the device BEFORE the network call and
   retried on the next page load, so an outage never loses a lead.
   Tests: node --test tests/
============================================ */
(function (root) {
  'use strict';

  var QUEUE_KEY = 'gnd_capture_queue_v1';
  var FIELDS = ['name', 'email', 'business', 'service', 'budget', 'times', 'message', 'referrer'];

  function uuid() {
    var c = typeof crypto !== 'undefined' ? crypto : null;
    if (c && c.randomUUID) return c.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (ch) {
      var r = (Math.random() * 16) | 0;
      return (ch === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
  }

  function create(cfg) {
    cfg = cfg || {};
    var url = (cfg.url || '').replace(/\/+$/, '');
    var key = cfg.key || '';
    var table = cfg.table || 'gnd_site_requests';
    var doFetch = cfg.fetch || (typeof fetch !== 'undefined' ? fetch.bind(root) : null);
    var storage = cfg.storage || null;
    if (!storage) { try { storage = root.localStorage; } catch (e) { storage = null; } }
    var ready = !!(url && key && doFetch);

    function read() {
      try { return JSON.parse(storage.getItem(QUEUE_KEY) || '[]') || []; } catch (e) { return []; }
    }
    function write(q) {
      try { q.length ? storage.setItem(QUEUE_KEY, JSON.stringify(q)) : storage.removeItem(QUEUE_KEY); } catch (e) {}
    }
    function bank(row) {
      var q = read();
      if (!q.some(function (r) { return r.id === row.id; })) { q.push(row); write(q); }
    }
    function unbank(id) {
      write(read().filter(function (r) { return r.id !== id; }));
    }

    /* 'saved' | 'retry' | 'rejected' */
    function send(row) {
      return Promise.resolve()
        .then(function () {
          return doFetch(url + '/rest/v1/' + table, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              apikey: key,
              Authorization: 'Bearer ' + key,
              Prefer: 'return=minimal'
            },
            body: JSON.stringify(row)
          });
        })
        .then(function (res) {
          // 409 = this id is already stored: an earlier attempt got through.
          if (res.ok || res.status === 409) return 'saved';
          // Other 4xx = the server will never accept this row. Do not retry it forever.
          if (res.status >= 400 && res.status < 500 && res.status !== 408 && res.status !== 429) return 'rejected';
          return 'retry';
        })
        .catch(function () { return 'retry'; });
    }

    function submit(kind, fields) {
      fields = fields || {};
      // Honeypot: a real visitor never fills the hidden "website" field.
      if (fields.website) return Promise.resolve({ ok: true });
      if (!ready) return Promise.resolve({ ok: false, queued: false });

      var row = { id: uuid(), kind: kind };
      row.page = cfg.page || (root.location ? root.location.pathname : null);
      FIELDS.forEach(function (f) {
        var v = fields[f];
        if (v !== undefined && v !== null && String(v).trim() !== '') row[f] = String(v).trim();
      });

      bank(row);
      return send(row).then(function (result) {
        if (result === 'saved') { unbank(row.id); return { ok: true }; }
        if (result === 'rejected') { unbank(row.id); return { ok: false, queued: false }; }
        return { ok: false, queued: true };
      });
    }

    /* Resend anything a previous visit could not deliver. Returns how many got through. */
    function flush() {
      if (!ready) return Promise.resolve(0);
      var sent = 0;
      return read().reduce(function (chain, row) {
        return chain.then(function () {
          return send(row).then(function (result) {
            if (result !== 'retry') unbank(row.id);
            if (result === 'saved') sent++;
          });
        });
      }, Promise.resolve()).then(function () { return sent; });
    }

    return { ready: ready, submit: submit, flush: flush, queued: function () { return read().length; } };
  }

  var api = { create: create };
  root.GNDCapture = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
