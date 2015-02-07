(function(){

var chart = {   
	svg : null,
	r: 3,
	width: 1200,
	height: 300,
	buffer: 100,
	series: {},
	append : function(time, price, stock){
		if(!this.series[stock]){
			this.series[stock] = [];
	 	}
		this.series[stock].push({time:time, price:price});
	
		return this;
	},

	initializeNormalization : function(series){
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
	},

	normalize : function(series){
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
		
	},

	toSvgYAxis : function(y){
		return this.height - y;
	},

	render : function(){
		var normalized = this.normalize(this.series);

		$(this.svg).children().remove();

		_(normalized).each(function(serie){
			_(serie).each(function(item, stock){
				this.renderCircle(item.x, this.toSvgYAxis(item.y), stock);
			}, this);
		}, this);
	},

	renderCircle : function(x, y, name){
		var ns = 'http://www.w3.org/2000/svg';
		var circle = document.createElementNS(ns, 'circle');
		circle.setAttributeNS(null, 'cx', x);
		circle.setAttributeNS(null, 'cy', y);
		////circle.setAttributeNS(null, 'class', stock);
		circle.setAttributeNS(null, 'r', this.r);
		this.svg.appendChild(circle);
	}

};

window.Charts = {
	create : function(options){
		var newChart = Object.create(chart);
		newChart.svg = options.svg;
		newChart.r = options.r || newChart.r;
		newChart.width = options.width || newChart.width;
		newChart.height = options.height || newChart.height;
		newChart.buffer = options.buffer || newChart.buffer;
		newChart.series = {};
		return newChart;
	}
};

})();
