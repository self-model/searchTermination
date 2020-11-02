jsPsych.plugins["p5Text"] = (function() {

	var plugin = {};

	plugin.info = {
		name: 'p5userInput',
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
			p.createCanvas(p.windowWidth, p.windowHeight);
			p.fill(255); //white
 			p.textSize(24)
			p.textAlign(p.LEFT, p.CENTER)
			p.strokeWeight(0)
			p.background(128); //gray
		}

		//organize everything in one sequence
		p.draw = function() {

			p.textFont('Quicksand');
			p.background(128); //gray
			p.push()
			// p.textFont('Corben')
			p.textSize(40);
			p.textAlign(p.CENTER, p.CENTER)
			p.text(trial.title,p.width/2-300, 50, 600, 50)
			p.pop()

			p.text(trial.text, p.width/2-300, 80, 600, 300);
			p.push()
			p.textSize(18)
			p.textAlign(p.CENTER, p.CENTER)
			p.text(trial.footer, p.width/2-300, 450, 600, 60);
			p.strokeWeight(1)
			p.stroke(255)
			p.line(p.width/2-150,450,p.width/2+150,450)
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
