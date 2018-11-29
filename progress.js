'use strict';



function BlockProgress(options) {
	this.block = options.block;
	this._value = options.value;
	this._position = 0;
	this._indicator = false;
		

	this.block.onclick = this._on_click.bind(this);
	
	this.block.oninput = this.changeValue.bind(this);

	this.block.onpaste = function() {
		return false;
	};


};


BlockProgress.prototype._toggle = function(elem) {
		function turnOn(elem) {
			elem.classList.remove('toggle__off');
			elem.classList.add('toggle__on');
		}

		function turnOff(elem) {
			elem.classList.remove('toggle__on');
			elem.classList.add('toggle__off');
		}
	
		if (elem.classList.contains('toggle__on')) {
			turnOff(elem);
		} else {
			turnOn(elem);
		}
};

BlockProgress.prototype._draw = function() {
	
	function inRad(num) {
		return num * Math.PI / 180;
	}
	
	//Функция рисования секторов окружности 
	function drawArch(options, revers, color) {
		ctx.beginPath();
	
		ctx.fillStyle = color;
		ctx.arc(0, 0, options.radius, options.arcEnd, 
			options.arcBegin, revers);
		ctx.lineTo(0, - options.radius + options.thickness);
		ctx.arc(0, 0, options.radius - options.thickness, 
			options.arcBegin, options.arcEnd, !revers);
		ctx.closePath();
		ctx.fill();
	}

	var canvas = this.block.getElementsByClassName('indicator')[0];
	if (canvas.getContext) {
		var width = canvas.offsetWidth;
		var height = canvas.offsetHeight;
		var arcBegin = inRad(-90);
		var arcEnd = inRad(this._value * 3.6) + arcBegin;
		var ctx = canvas.getContext('2d');
		ctx.save();
		ctx.clearRect(0, 0, 
			canvas.offsetWidth, canvas.offsetHeight);
		ctx.translate(width/2, height/2);
		ctx.rotate(inRad(this._position));
		if (this._value == 0) {
			var value = 2 * Math.PI + arcBegin;
			drawArch({radius: width / 2, thickness: 15, arcBegin, 
				arcEnd: value}, false, '#BFBFBF');
		} else if (this._value == 100) {
			drawArch({radius: width / 2, thickness: 15, arcBegin, 
				arcEnd}, true, '#FFFF00');
		} else {
			drawArch({radius: width / 2, thickness: 15, arcBegin, 
				arcEnd}, true, '#FFFF00');
			drawArch({radius: width / 2, thickness: 15, arcBegin, 
				arcEnd}, false, '#BFBFBF');
		}				
		ctx.restore();
	
	}

	
};


BlockProgress.prototype.hideAndSeekInd = function() {
	var canvas = this.block.getElementsByClassName('indicator')[0];
	var elem = this.block.getElementsByClassName('switcher')[0];
	this._toggle(elem);
		
	function hide() {
		canvas.classList.remove('indicator__on');
		canvas.classList.add('indicator__off');
	}
	
	function display() {
		canvas.classList.remove('indicator__off');
		canvas.classList.add('indicator__on');
	}
	
	if (canvas.classList.contains('indicator__on')) {
		hide();
	} else {
		display();
	}
	 
};


BlockProgress.prototype.toggleAnimation = function() {
	var elem = this.block.getElementsByClassName('animator')[0];
	this._toggle(elem);
	
	var self = this;
	
	function animateCircle(draw, angularVelocity) {
		requestAnimationFrame(function animate(time) {
			self._position += angularVelocity;
			draw(self._position);
			// если флаг действителен продолжить анимацию
			if (self._indicator) {
				requestAnimationFrame(animate);
			}
		});
	
	}		
		
	var myDraw = this._draw.bind(this);

	function stopAnimation() {
		self._indicator = false;
	}

	function beginAnimation() {
		self._indicator = true;
		animateCircle(myDraw, 1);			
	}
	
	if (this._indicator) {
		stopAnimation();
	} else {
		beginAnimation();
	}
};


BlockProgress.prototype.changeValue = function() {
	var input = this.block.getElementsByClassName('userValue')[0];
	var value = input.value;
	if (value.length > 3) {
		value = value.slice(0,3);
	}
	if (value > 100) {
		value = 100;
	}
	if (value <= 0) {
		value = 0;
	}
	value = Number(value);
	if (isNaN(value)) value = 0;//защита от дурака
	this._value = input.value = value;
	this._draw();
};


BlockProgress.prototype._on_click = function(e) {
	var target = e.target;
	if (target.tagName != 'DIV') return;
	if (!target.classList.contains('toggle') && 
		!target.classList.contains('commutator')) {
		return;
	}
	if (target.classList.contains('commutator')) {
		target = target.parentNode;
	}
	if (target.classList.contains('animator')) {
		this.toggleAnimation();
	}	
	if (target.classList.contains('switcher')) {
		this.hideAndSeekInd();
	}
		
};






var progress = new BlockProgress({
	block: document.body.getElementsByClassName('progress')[0],
	value: document.body.getElementsByClassName('userValue')[0].value
});

progress.changeValue();
