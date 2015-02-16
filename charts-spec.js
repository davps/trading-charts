describe('Tests for charts.js', function(){
	var charts;
	beforeEach(function(){
		charts = Charts.create({
			buffer:3,
			width: 100,
			height:100
		});	
		charts.append(1, 100, 'AAPL');
		charts.append(2, 90, 'AAPL');
		charts.append(3, 0, 'AAPL');
		charts.append(4,  90, 'AAPL');
		charts.append(5, 80, 'AAPL');
	});


	describe('getSerie(stock)', function(){
		it('Given a stock ID, return the serie of the stock', function(){
			var serie = charts.getSerie('AAPL');
			expect(serie.length).toBe(5);
									
		});
		it('Given an incorrect stock ID,  return an empty array', function(){
			var serie = charts.getSerie('AAPLrrr');
			expect(serie.length).toBe(0);
		});
	});

	describe('Appending new realtime data.', function(){
		it('Append a single value sucessfully.', function(){
			expect(charts.series.AAPL.length).toBe(5);
		});

		it('Initialize normalization.', function(){
			var height = 100;
			charts = Charts.create({buffer:3, width:100, height:height});
			var initializedNormals = charts.initializeNormalization({ AAPL:[] });
			var aapl = initializedNormals.AAPL;
			var price = 0;	
			expect(aapl[0]).toEqual({x:0, y:price, ref:null});
			expect(aapl[1]).toEqual({x:50, y:price, ref:null});
			expect(aapl[2]).toEqual({x:100, y:price, ref:null});
		});

		it('Normalize the values.', function(){
			var normalized = charts.normalize(charts.series).AAPL;
			var l = normalized.length;
			expect(normalized.length).toBe(3);
			expect(normalized[0].x).toBe(0);
			expect(normalized[1].x).toBe(50);
			expect(normalized[2].x).toBe(100);
		});

		var expectations = [
			{
				qty: 1,
				init: function(charts){
					charts.append(1, 100, 'AAPL');
				},
				val: [ [0,0], [50,0], [100,100] ]
			},
			{
				qty: 2,
				init: function(charts){
					charts.append(1, 100, 'AAPL');
					charts.append(2, 90, 'AAPL');
				},
				val: [ [0,0], [50,100], [100,90] ]
			},
			{
				qty: 3,
				init: function(charts){
					charts.append(1, 100, 'AAPL');
					charts.append(2, 90, 'AAPL');
					charts.append(3, 0, 'AAPL');
				},
				val: [ [0,100], [50,90], [100,0] ]
			},
			{
				qty: 4,
				init: function(charts){
					charts.append(1, 100, 'AAPL');
					charts.append(2, 90, 'AAPL');
					charts.append(3, 0, 'AAPL');
					charts.append(4,  90, 'AAPL');
				},
				val: [ [0,100], [50,0], [100,100] ]
			},
			{
				qty: 5,
				init: function(charts){
					charts.append(1, 100, 'AAPL');
					charts.append(2, 90, 'AAPL');
					charts.append(3, 0, 'AAPL');
					charts.append(4,  90, 'AAPL');
					charts.append(5, 80, 'AAPL');
				},
				val: [ [0,0], [50,100], [100, 80*100/90] ]
			}
		];	
		_(expectations).each(function(exp){
			describe('When appending '+exp.qty+' values.', function(){
				describe('Should fill the other slots with prices=0.', function(){
					charts = Charts.create({
						buffer:3,
						width: 100,
						height:100
					});
					exp.init.call(this, charts);
					var n = charts.normalize(charts.series).AAPL;
					var l = n.length;
					it('It will create 3 normalized values', function(){
						expect(l).toBe(3);
					});
					it('The first item should be correct', function(){
						expect(n[0].x).toBe(exp.val[0][0]);
						expect(n[0].y).toBe(exp.val[0][1]);
					});
					it('The second item should be correct', function(){
						expect(n[1].x).toBe(exp.val[1][0]);
						expect(n[1].y).toBe(exp.val[1][1]);
					});
					it('The third item should be correct', function(){
						expect(n[2].x).toBe(exp.val[2][0]);
						expect(n[2].y).toBe(exp.val[2][1]);
					});
				});
			});
		}, this);
		/*
		describe('When appending two values', function(){
			describe('Should fill the first slot with price=0.', function(){
				charts = new Charts({
					buffer:3,
					width: 100,
					height:100
				});	
				var n = charts.normalize(charts.series).AAPL;
				charts.append(1, 100, 'AAPL');
				charts.append(2, 90, 'AAPL');
				var l = n.length;
				it('It will create 3 normalized values', function(){
					expect(l).toBe(3);
				});
				it('The first item should be correct', function(){
					expect(n[0].x).toBe(0);
					expect(n[0].y).toBe(100);
				});
				it('The second item should be correct', function(){
					expect(n[1].x).toBe(50);
					expect(n[1].y).toBe(90);
				});
				it('The third item should be correct', function(){
					expect(n[2].x).toBe(100);
					expect(n[2].y).toBe(0);
				});
				
			});
		});
		*/
	});


});
