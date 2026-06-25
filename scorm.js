// Adaptador SCORM básico. Funciona aunque Brightspace no exponga API SCORM.
window.SCORM = {
  api: null,
  initialized: false,
  findAPI(win) {
    let tries = 0;
    while (win && tries < 10) {
      if (win.API_1484_11) return win.API_1484_11;
      if (win.API) return win.API;
      win = win.parent;
      tries++;
    }
    return null;
  },
  init() {
    this.api = this.findAPI(window);
    try {
      if (this.api?.Initialize) this.api.Initialize('');
      else if (this.api?.LMSInitialize) this.api.LMSInitialize('');
      this.initialized = true;
    } catch(e) { console.warn('SCORM init error', e); }
  },
  saveScore(score, data) {
    const scaled = Math.max(0, Math.min(1, score / 5));
    try {
      if (this.api?.SetValue) {
        this.api.SetValue('cmi.score.raw', String(score));
        this.api.SetValue('cmi.score.min', '0');
        this.api.SetValue('cmi.score.max', '5');
        this.api.SetValue('cmi.score.scaled', String(scaled));
        this.api.SetValue('cmi.suspend_data', JSON.stringify(data || []).slice(0, 4000));
        this.api.Commit('');
      } else if (this.api?.LMSSetValue) {
        this.api.LMSSetValue('cmi.core.score.raw', String(score));
        this.api.LMSCommit('');
      }
    } catch(e) { console.warn('SCORM save error', e); }
  },
  finish() {
    try {
      if (this.api?.SetValue) {
        this.api.SetValue('cmi.completion_status', 'completed');
        this.api.SetValue('cmi.success_status', 'passed');
        this.api.Commit('');
        this.api.Terminate('');
      } else if (this.api?.LMSSetValue) {
        this.api.LMSSetValue('cmi.core.lesson_status', 'completed');
        this.api.LMSCommit('');
        this.api.LMSFinish('');
      }
    } catch(e) { console.warn('SCORM finish error', e); }
  }
};
