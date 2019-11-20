import ViewUI  from 'view-design'

import { Page, PageSection } from '../components/page'

import { routeCmpts } from '../router/routes'

export default ({ zeros, router, Vue }) => {
  Vue.use(ViewUI, {
    // i18n: (key, value) => i18n.t(key, value)
  })

  Vue.component(Page.name, Page)
  Vue.component(PageSection.name, PageSection)
  
  Vue.prototype.$cmpt = initialize(zeros, Vue)
}

function initialize (zeros, Vue) {
  function getRouteCmpt (path) {
    return routeCmpts[path]
  }

  // Find components upward
  function findComponentUpward (context, componentName, componentNames) {
    if (typeof componentName === 'string') {
        componentNames = [componentName];
    } else {
        componentNames = componentName;
    }

    let parent = context.$parent;
    let name = parent.$options.name;
    while (parent && (!name || componentNames.indexOf(name) < 0)) {
        parent = parent.$parent;
        if (parent) name = parent.$options.name;
    }
    return parent;
  }

  // Find component downward
  function findComponentDownward (context, componentName) {
    const childrens = context.$children;
    let children = null;

    if (childrens.length) {
        for (const child of childrens) {
            const name = child.$options.name;
            if (name === componentName) {
                children = child;
                break;
            } else {
                children = findComponentDownward(child, componentName);
                if (children) break;
            }
        }
    }
    return children;
  }

  // Find components downward
  function findComponentsDownward (context, componentName) {
    return context.$children.reduce((components, child) => {
        if (child.$options.name === componentName) components.push(child);
        const foundChilds = findComponentsDownward(child, componentName);
        return components.concat(foundChilds);
    }, []);
  }

  // Find components upward
  function findComponentsUpward (context, componentName) {
    let parents = [];
    const parent = context.$parent;
    if (parent) {
        if (parent.$options.name === componentName) parents.push(parent);
        return parents.concat(findComponentsUpward(parent, componentName));
    } else {
        return [];
    }
  }

// Find brothers components
  function findBrothersComponents (context, componentName, exceptMe = true) {
    let res = context.$parent.$children.filter(item => {
        return item.$options.name === componentName;
    });
    let index = res.findIndex(item => item._uid === context._uid);
    if (exceptMe) res.splice(index, 1);
    return res;
  }

  return {
    getRouteCmpt,
    findComponentUpward,
    findComponentDownward,
    findComponentsDownward,
    findComponentsUpward,
    findBrothersComponents
  }
}
