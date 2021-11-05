class Holder<Held> {
  instance: Held | null
  builder: () => Held

  constructor(builder: () => Held) {
    this.instance = null
    this.builder = builder

    this.build()
  }


  build() {
    this.instance = this.builder()
  }
}

export const single = <Shape extends Record<string, any>>(builder: () => Shape) => {
  const interceptor = {
    get: function (holder: Holder<Shape>, prop: string) {
      if (prop === 'debug' && !!process.env.JANUS_DEBUG) {
        return holder.instance
      }


      if (!holder.instance) {
        holder.build()
      }

      return holder.instance![prop]
    }
  }

  // hint generic type for completion to work. This will still show up as proxy but with all <Shape> properties
  return new Proxy(new Holder(builder), interceptor) as unknown as Shape & { debug: () => Shape }
}
