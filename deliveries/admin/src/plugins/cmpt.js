import ViewUI  from 'view-design'

import Vue2Editor, { Quill } from 'vue2-editor'

import QuillUndoRedo from '@/libs/quill/quill-undo-redo-module'
import QuillWordCounter from '@/libs/quill/quill-word-counter-module'
import QuillImageResize from '@/libs/quill/quill-image-resize-module'
import QuillZerosMedia from '@/libs/quill/quill-zeros-media-module'

import 'swiper/dist/css/swiper.css'
import VueAwesomeSwiper from 'vue-awesome-swiper'

import 'cropperjs/dist/cropper.css'
import VueCropper from 'vue-cropperjs'

import 'video.js/dist/video-js.css'
// import VideoJs from 'video.js'

import { Page, PageSection, PageResult } from '@components/page'
import { ListNav, ListActions, ListAction, ListItemActions, ListItemAction } from '@components/list'
import { VideoPlayer, AudioPlayer } from '@components/media'
import { ModalHeader, ModalFullscreenIcon } from '@components/modal'
import { ImageResizer } from '@components/resizer'
import { UserAvatar } from '@components/avatar'

import { routeCmpts } from '@/router/routes'

export default ({ zeros, router, Vue }) => {
  Vue.use(ViewUI, {
    // i18n: (key, value) => i18n.t(key, value)
  })

  // quill editor, 因为 quill-image-resize-module 内使用了window.Quill
  window.Quill = Quill
  
  Quill.register("modules/undoRedo", QuillUndoRedo)
  Quill.register("modules/wordCounter", QuillWordCounter)
  Quill.register("modules/zerosMedia", QuillZerosMedia)
  Quill.register("modules/imageResize", QuillImageResize)

  const QuillSize = Quill.import("attributors/style/size")
  QuillSize.whitelist = ["12px", false, "15px", "16px", "17px", "18px", "20px", "24px"]
  Quill.register(QuillSize, true)

  Vue.use(Vue2Editor)

  Vue.use(VueAwesomeSwiper, {})

  Vue.component('vue-cropper', VueCropper)

  // 注册全局自定义组件
  Vue.component(Page.name, Page)
  Vue.component(PageSection.name, PageSection)
  Vue.component(PageResult.name, PageResult)

  Vue.component(ListNav.name, ListNav)
  Vue.component(ListActions.name, ListActions)
  Vue.component(ListAction.name, ListAction)
  Vue.component(ListItemActions.name, ListItemActions)
  Vue.component(ListItemAction.name, ListItemAction)

  Vue.component(ModalHeader.name, ModalHeader)
  Vue.component(ModalFullscreenIcon.name, ModalFullscreenIcon)
  Vue.component(ImageResizer.name, ImageResizer)

  Vue.component(AudioPlayer.name, AudioPlayer)
  Vue.component(VideoPlayer.name, VideoPlayer)

  Vue.component(UserAvatar.name, UserAvatar)
  
  Vue.prototype.$cmpt = initialize()
}
function initialize () {
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
