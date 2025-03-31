declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'vue-router'
declare module 'element-plus' {
  export * from 'element-plus/lib/components'
}

declare module 'vue-draggable-next' {
  import { DefineComponent } from 'vue'
  const VueDraggableNext: DefineComponent<{}, {}, any>
  export default VueDraggableNext
}