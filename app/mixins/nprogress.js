import NProgress from 'nprogress';

export default {
  componentWillMount: function() {
    console.log('start');
    NProgress.start();
  },

  componentDidMount: function() {
    console.log('done');
    NProgress.done();
  },
};
