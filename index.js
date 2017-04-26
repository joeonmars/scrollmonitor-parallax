(function( factory ) {
	if (typeof define !== 'undefined' && define.amd) {
		define(['scrollmonitor'], factory);
	} else if (typeof module !== 'undefined' && module.exports) {
		module.exports = factory(require('scrollmonitor'));
	} else {
		window.parallax = factory(window.scrollMonitor);
	}
})(function (scrollMonitor) {

	function SpeedParallax (element, speed, fade, easing) {
		this.speed = speed;
		this.fade = fade;
		this.easing = easing;
		this.element = element;
	};

	SpeedParallax.prototype.handleScroll = function (distance, height) {
		var pixels = distance * this.speed;
		this.element.style.transform = 'translateY(' + pixels + 'px)';

		if (this.fade) {
			var ratio = distance/height;
			ratio = Math.max(0, Math.min(1, ratio));
			ratio = 1 - (this.easing ? this.easing(ratio) : ratio);

			this.element.style.opacity = ratio;
		}
	};

	function getNumber (field, options, ratio) {
		var easing = options.easing[field];
		var start = options.start[field];
		var end = options.end[field];

		if (easing) {
			ratio = easing(ratio);
		}

		if (!start) {
			return end * ratio;
		}

		var difference = end - start;
		var change = difference * ratio;
		return start + change;
	};

	function Root (element, offsets) {
		this.watcher = scrollMonitor.create(element, offsets);
		this.items = [];

		this.pxThru = 0;

		var self = this;

		function handleScroll () {
			
			var start = Math.max(0, self.watcher.top - scrollMonitor.viewportHeight);
			self.pxThru = Math.max(0, scrollMonitor.viewportTop - start);

			for (var i=0; i < self.items.length; i++) {
				self.items[i].handleScroll.call(self.items[i], self.pxThru, self.watcher.height);
			}
		}

		this.watcher.enterViewport(function () {
			window.addEventListener('scroll', handleScroll);
		});
		this.watcher.exitViewport(function () {
			window.removeEventListener('scroll', handleScroll);
		});
	};

	Root.prototype.add = function add (element, speed, fade, easing) {
		var newItem = new SpeedParallax(element, speed, fade, easing);
		this.items.push(newItem);
	};

	return {
		create: function (item, offsets) {
			return new Root(item, offsets);
		}
	};
});