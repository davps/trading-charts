(function(){

var chart = {   
	svg : null,
	r: 3,
	width: 1200,
	height: 300,
	buffer: 100,
	series: {},
	seriesColor: [],
	
	/**
	 * Given a stock ID, return the values of the stock over the time
	 */
	getSerie: function(stock){
		if(!this.series[stock]){
			this.series[stock] = [];
		}
		return this.series[stock];
	},

	/**
	 * Append a stock value to the serie of that stock
	 */
	append: function(time, price, stock){
		if( _(this.seriesColor).where({stock:stock}).length === 0){
			this.seriesColor.push({
				color: this.createRandomColor(),
				stock: stock
			});
		}

		this.getSerie(stock).push({time:time, price:price});

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

		return normalized;		
	},

	toSvgYAxis : function(y){
		return this.height - y;
	},

	createRandomColor: function(){
		var randomInt = function(min, max){
			var min = 0, max = 255;
			var val = Math.floor(Math.random() * (max - min + 1) + min);
			var hex;
			if(val < 16){
				hex = '0' + val.toString(16);
			}else{
				hex = val.toString(16);				
			}
			return hex;
		};
		var r = randomInt();
		var g = randomInt();
		var b = randomInt();
		return '#'+r+g+b;
	},

	render : function(){
		var normalized = this.normalize(this.series);

		$(this.svg).children().remove();

		_(normalized).each(function(serie, stock){
			var color = _(this.seriesColor).where({stock:stock})[0].color;
			var prevItem;
			_(serie).each(function(item, index){
				if(prevItem){
					this.renderLine(prevItem.x, this.toSvgYAxis(prevItem.y), item.x, this.toSvgYAxis(item.y), stock, color);
				}
				this.renderCircle(item.x, this.toSvgYAxis(item.y), index, stock, color);
				prevItem = item;
			}, this);
		}, this);
	},

	renderLine : function (x1, y1, x2, y2, stock, color) {
		var ns = 'http://www.w3.org/2000/svg';
		var line = document.createElementNS(ns, 'line');
		line.setAttributeNS(null, 'x1', x1);
		line.setAttributeNS(null, 'y1', y1);
		line.setAttributeNS(null, 'x2', x2);
		line.setAttributeNS(null, 'y2', y2);
		line.setAttributeNS(null, 'class', stock);
		line.setAttributeNS(null, 'stroke', color);
		this.svg.appendChild(line);
	},

	renderCircle : function(x, y, index, stock, color){
		var ns = 'http://www.w3.org/2000/svg';
		var circle = document.createElementNS(ns, 'circle');
		circle.setAttributeNS(null, 'cx', x);
		circle.setAttributeNS(null, 'cy', y);
		circle.setAttributeNS(null, 'class', stock);
		circle.setAttributeNS(null, 'fill', color);
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
