import { requestAnimationFrame, cancelAnimationFrame } from './request-animation-frame-shim';
export default function ActiveQueue() {

	let fs=[],
		frameRequest,
		next;

	

	this.run = (id) => {

	}

	this.add = (f) => {
		fs.push(f);
	}

	this.getList = () => {
		return fs;
	}

	this.setNext = (id) => {
		//console.log("setting next",id)
		next=id;
	}

	this.start = (id) => {
		//console.log("starting with",id)
		this.setNext(id);
		
		frameRequest = requestAnimationFrame(function checkNext(time) {
			if(!fs.length) {
				//console.log("list is empty")
				cancelAnimationFrame(checkNext)
				return;
			}
			//console.log(time,next)
			if(next) {
				//console.log("drawing",next)
				let f=fs.find(d=>(d.id===next));
				if(f) {
					f.f();
					fs=fs.filter(d=>(d.id!==next));
				}
				next=false;
			}
			/*
			let f=fs.shift();
			console.log("running",f.id);
			f.f();
			*/
			frameRequest = requestAnimationFrame(checkNext)
		});

	}
}