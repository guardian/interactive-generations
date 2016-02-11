export let requestAnimationFrame = 'function' === typeof window.requestAnimationFrame ?
        (cb) => window.requestAnimationFrame(cb) :
    'function' === typeof window.webkitRequestAnimationFrame ?
        (cb) => window.webkitRequestAnimationFrame(cb) :
    'function' === typeof window.mozRequestAnimationFrame ?
        (cb) => window.mozRequestAnimationFrame(cb) :
    (cb,element) => {
        let currTime = new Date().getTime();
        let timeToCall = Math.max(0, 16 - (currTime - lastTime));
        let id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
            timeToCall);

        lastTime = currTime + timeToCall;
        
        return id;
    };

export let cancelAnimationFrame = 'function' === typeof window.cancelAnimationFrame ?
        (cb) => window.cancelAnimationFrame(cb) :
    'function' === typeof window.webkitCancelAnimationFrame ?
        (cb) => window.webkitCancelAnimationFrame(cb) :
    'function' === typeof window.webkitCancelRequestAnimationFrame ?
        (cb) => window.webkitCancelRequestAnimationFrame(cb) :
    'function' === typeof window.mozCancelAnimationFrame ?
        (cb) => window.mozCancelAnimationFrame(cb) :
    (id) => clearTimeout(id);