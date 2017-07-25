import Ember from 'ember';

export default Ember.Component.extend({
  selections: Ember.computed.alias('jobs.STATES'),
  showLogs: true,
  jobs: Ember.inject.service(),

  setup: Ember.on('init', function() {
    this.set('job.selected', this.get('job.state'));
  }).observes('job.id'),

  selectedStateDidChange: Ember.observer('job.selected', function() {
    if (Ember.isEmpty(this.get('job.state'))) {
      return;
    }

    if (this.get('job.state') !== this.get('job.selected')) {
      this.set('job.state', this.get('job.selected'));

      this.get('jobs').updateState(this.get('job.id'), this.get('job.state'));
    }
  }),

  didRender: function() {
    if (!this.logInterval) {
      this.logInterval = setInterval(() => {
        this.get('jobs').getLog(this.get('job.id'))
          .then((logs) => {
            const formatted_logs = logs.map(row => {
              if (row.toLowerCase().indexOf('error:') === 0){
                return `<div class="log-row error"> ${row}</div>`;
              } else {
                return `<div class="log-row"> ${row}</div>`;
              }
            });
            this.set('log', formatted_logs);
          });
      }, 1000);
    }
  },

  willDestroyElement:function(){
    console.log('will destroy');
    clearInterval(this.logInterval);
  },

  actions: {
    goToJob(job) {
      this.sendAction('action', job);
    },

    switchView(){
      const showLogs = this.get('showLogs');
      this.set('showLogs', !showLogs);
    },

    removeJob(job) {
      this.sendAction('removeAction', job);
    },
  },
});
