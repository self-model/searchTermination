jsPsych.plugins["p5Text"] = (function() {

	var plugin = {};

	plugin.info = {
		name: 'p5Text',
		parameters: {
			title: {
				type: jsPsych.plugins.parameterType.STRING,
				default: '',
			},
			text: {
				type: jsPsych.plugins.parameterType.STRING,
				default: 'text',
			},
			footer: {
				type: jsPsych.plugins.parameterType.STRING,
				default: 'press Space to continue',
			},
			draw_function: {
				type: jsPsych.plugins.parameterType.FUNCTION,
				default: function(p, trial) {return}
			},
			key_function: {
				type: jsPsych.plugins.parameterType.FUNCTION,
				default: function(p, trial) {return}
			},
			tite: {
				type: jsPsych.plugins.parameterType.STRING,
				default: ''
			}
		}
	}

	plugin.trial = function(display_element, trial) {

		display_element.innerHTML = ''

		//open a p5 sketch
		let sketch = function(p) {

		//sketch setup
		p.setup = function() {
			p.createCanvas(window.innerWidth, window.innerHeight);
			p.fill(255); //white
			p.strokeWeight(0)
			p.background(100); //gray
			p.textFont('Quicksand');
      p.rectMode(p.CENTER)
		}

		//organize everything in one sequence
		p.draw = function() {

      p.textAlign(p.LEFT,p.CENTER)
			p.background(100); //gray
			p.textSize(24)
			p.text(trial.text, p.width/2, p.height*(5/12), 600, 300);

			p.push()
			p.textAlign(p.CENTER, p.CENTER)
			// p.textStyle(p.BOLD)
			p.textSize(50)
			p.text(trial.title,p.width/2, p.height/6, 600, 100)
			// p.pop()
			//
			// p.push()
			p.textSize(18)
			p.textStyle(p.NORMAL)
			p.text(trial.footer, p.width/2, p.height*(5/6), 600, 60);
			p.strokeWeight(1)
			p.stroke(255)
			p.line(p.width/2-150,p.height*(3/4),p.width/2+150,p.height*(3/4))
			p.pop()

			trial.draw_function(p, trial)
		}

		p.keyPressed = function() {

			// only regard relevant key presses during the response phase
			if (p.keyCode==32) {
				p.remove()
				// end trial
				var trial_data =- {}
				jsPsych.finishTrial(trial_data);
			}

			trial.key_function(p, trial)
		}

		p.mouseClicked = function() {
			p.remove()
			var trial_data =- {}
			jsPsych.finishTrial(trial_data);
		}
	}

		// start sketch!
		let myp5 = new p5(sketch);
}
//

//Return the plugin object which contains the trial
return plugin;
})();
