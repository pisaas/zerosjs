export default {
  name: 'RenderCatData',
  functional: true,

  props: {
    render: Function,
    cat: Object
  },

  render: (h, ctx) => {
    const params = {
      cat: ctx.props.cat
    };

    return ctx.props.render(h, params);
  }
};