(function(){
   
window.Charts = function(options){
	this.svg = options.svg;
	this.options = options;
	this.r = 3;
	this.width = options.width || 1200;
	this.height = options.height || 300;
	this.buffer = options.buffer ||  100;

	this.series = {};
};

Charts.prototype.append = function(time, price, stock){
	if(!this.series[stock]){
		this.series[stock] = [];
	}
	this.series[stock].push({time:time, price:price});
	
	return this;
};

Charts.prototype.initializeNormalization = function(series){
	var normalized = {};
	_(series).each(function(serie, stock){
		var length = serie.length;

		if(!normalized[stock]){
			normalized[stock] = [];
		}

		for(var i = 0; i < this.buffer; i++){
			normalized[stock].push({
				x: this.width * i / (this.buffer - 1),
				y: 0,
				ref: null
			});
		}
	}, this);
	return normalized;
};

Charts.prototype.normalize = function(series){
	var normalized = this.initializeNormalization(series);
	
	_(series).each(function(serie, stock){
		var length = serie.length;
		var serie2, minPrice;
		if( (length - this.buffer) > 0){
			serie2 = _(serie).clone().slice(length - this.buffer);
			minPrice = _.min(_(serie2).pluck('price'));
		}else{
			serie2 = _(serie).clone();
			minPrice = 0;
		}
		var maxPrice = _.max(_(serie2).pluck('price'));
		var counter = normalized[stock].length - serie2.length;
		_(serie2).each(function(item, index){
			var nPrice;
			if(maxPrice !== minPrice){
				nPrice = (item.price - minPrice) / (maxPrice - minPrice) * this.height;
			}else{
				nPrice = maxPrice;
			}
			normalized[stock][counter].y = nPrice;			
			normalized[stock][counter].ref = item;
			counter++;
		}, this);
	}, this);

	/*
	_(series).each(function(serie, stock){
		var minTime = _.min(_(serie).pluck('time'));
		var maxTime = _.max(_(serie).pluck('time'));AAPe
		var minPrice = _.min(_(serie).pluck('price'));
		var maxPrice = _.max(_(serie).pluck('price'));
		var length = serie.length;
		_(serie).each(function(item, index){
			if(!normalized[stock]){
				normalized[stock] = [];
			}
			if( !((length - this.buffer) > index) ){
				normalized[stock].push({
					time: this.width - (item.time - minTime) / (maxTime - minTime) * this.width,
					price: this.height - (item.price - minPrice) / (maxPrice - minPrice) * this.height,
					ref: item
				});
			}
		}, this);	
	}, this);
	*/
	return normalized;
	
};

Charts.prototype.toSvgYAxis = function(y){
	return this.height - y;
};

Charts.prototype.render = function(){
	var normalized = this.normalize(this.series);

	$(this.svg).children().remove();

	_(normalized).each(function(serie){
		_(serie).each(function(item, stock){
			this.renderCircle(item.x, this.toSvgYAxis(item.y), stock);
		}, this);
	}, this);
};

Charts.prototype.renderCircle = function(x, y, name){
	var ns = 'http://www.w3.org/2000/svg';
	var circle = document.createElementNS(ns, 'circle');
	circle.setAttributeNS(null, 'cx', x);
	circle.setAttributeNS(null, 'cy', y);
	////circle.setAttributeNS(null, 'class', stock);
	circle.setAttributeNS(null, 'r', this.r);
	this.svg.appendChild(circle);
};




})();
