let contextsArray = [];

export function interceptGraphicContexts(){
  let getOriginalContext = HTMLCanvasElement.prototype.getContext;

  HTMLCanvasElement.prototype.getContext = function (type, options) {
      let context = getOriginalContext.call(this, type, options);

      if (type === 'webgl' || type === 'webgl2')
        contextsArray.push(context);

      return context;
    }
}   

export function removeGraphicContexts(){
    contextsArray.forEach(function(context) {
      if (context && (context instanceof WebGLRenderingContext || context instanceof WebGL2RenderingContext)) {
        const loseContextExtension = context.getExtension('WEBGL_lose_context');
        if (loseContextExtension) {
          loseContextExtension.loseContext();
        }
      }
    });
  
    contextsArray = [];
  }