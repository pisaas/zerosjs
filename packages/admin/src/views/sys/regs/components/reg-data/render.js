export default {
  name: 'RenderRegData',
  functional: true,

  props: {
    render: Function,
    reg: Object
  },

  render: (h, ctx) => {
    const params = {
      reg: ctx.props.reg
    };

    return ctx.props.render(h, params);
  }
};