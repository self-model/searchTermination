jsPsych.plugins["p5vs_yn"] = (function() {

	var plugin = {};

	plugin.info = {
		name: 'p5vs_yn',
		parameters: {
			title: {
				type: jsPsych.plugins.parameterType.STRING,
				default: '',
			},
      target_function: {
        type: jsPsych.plugins.parameterType.FUNCTION,
        default: (p,t,du) => {p.rect(0,0,p.sin(t/1000)*du/10,p.sin(t/1000)*du/10)}
      },
      distractor_function: {
        type: jsPsych.plugins.parameterType.FUNCTION,
        default: (p,t,du,dist_num) => {p.circle(0,0,p.sin(t/1000+dist_num/5)*du/10)}
      },
      set_size: {
        type: jsPsych.plugins.parameterType.NUMBER,
        default: 10
      },
      target_present: {
        type: jsPsych.plugins.parameterType.BOOL,
        default: false
      },
      instructions_duration: {
        type: jsPsych.plugins.parameterType.FLOAT,
        default: 1000 //ms
      },
      fixation_duration: {
        type: jsPsych.plugins.parameterType.FLOAT,
        default: 1200 //ms
      },
      choices: {
				type: jsPsych.plugins.parameterType.STRING,
				pretty_name: "Choices",
				description: "Choice keys",
        default: ['f','j']
			}
		}
	}

	plugin.trial = function(display_element, trial) {

		display_element.innerHTML = ''

		//open a p5 sketch
		let sketch = function(p) {

    const du = p.min([window.innerWidth, window.innerHeight, 600])*7/10 //drawing unit
    const grid_size =  p.ceil(p.sqrt(trial.set_size+1))+3
    const ticks = Array.from(new Array(grid_size), (x,i) => i/grid_size-0.5).slice(1)
    var positions = []
    for (var i = 0; i < ticks.length; i++) {
      // This is where you'll capture that last value
      for (var j = 0; j < ticks.length; j++) {
        positions.push([ticks[i],ticks[j]]);
      }
    }
    p.shuffle(positions, true)
    trial.target_position = positions[0]
    trial.distractor_positions = positions.slice(1,trial.set_size)

		trial.jitter = p.random(1000)
		trial.fixation_duration+=trial.jitter


		//sketch setup
		p.setup = function() {
			p.createCanvas(window.innerWidth, window.innerHeight);
			p.strokeWeight(2)
			p.textFont('Quicksand');
      p.noCursor()
			p.rectMode(p.CENTER)
		}

    function presentFixationCross() {
      p.push()
      p.fill(255)
			// p.rect(0, 0, 24, 2);
			// p.rect(0, 0, 2, 24);
			// trial.lff = p.frameCount; //last fixation frame
			p.textAlign(p.CENTER,p.CENTER)
			p.textSize(30)
			p.fill(0)
			p.text('Your target is:',0,-du*1/6)
			p.translate(0,0)
			trial.target_function(p,p.millis(),du)
      p.pop()
		}

    function presentArray () {

      // Draw target
      if (trial.target_present) {
        p.push()
        p.translate(du*positions[0][0],du*positions[0][1])
        trial.target_function(p,p.millis(),du)
        p.pop()
      } else {
				p.push()
        p.translate(du*positions[0][0],du*positions[0][1])
        trial.distractor_function(p,p.millis(),du,0)
        p.pop()
			}

      // Draw distractors
      for (i=1; i<trial.set_size; i++) {
       p.push()
        p.translate(du*positions[i][0],du*positions[i][1])
        trial.distractor_function(p,p.millis(),du, i)
        p.pop()
      }
    }
		//organize everything in one sequence
		p.draw = function() {

      p.background(100); //gray

      p.translate(window.innerWidth/2, window.innerHeight/2)

      // Draw search array

			p.stroke(0)
			p.fill('white')
      p.rect(0, 0, du,du)

			p.push()
			p.fill(255)
			p.noStroke()
			p.textSize(30)
			p.textAlign(p.CENTER,p.CENTER)
			p.text('YES',du*0.7,0)
			p.text('NO',-du*0.7,0)
			p.textSize(20)
			p.text('press '+trial.choices[1].toUpperCase(),du*0.7,40)
			p.text('press '+trial.choices[0].toUpperCase(),-du*0.7,40)
			p.pop()

      // Draw choice mapping
      p.push()
      p.textAlign(p.CENTER,p.CENTER)
      p.fill(255)
      p.stroke(128)
      p.textSize(30)
			// p.text('Is there a \n \n \n in the square?',0,-du*2/3)
      p.text('Is the target present?',0,-du/2-20,)
			p.translate(0,-du*2/3)
			// trial.target_function(p,p.millis(),du)
      p.pop()
     if (p.millis()<trial.fixation_duration-200) {
        presentFixationCross()
        trial.status = 'presenting fixation'
      } else if (p.millis()<trial.fixation_duration) {
         trial.status = 'presenting fixation'
			 } else if (trial.response==undefined) {
        presentArray()
        trial.status = 'collecting response'
      } else { //trial ended
        p.remove()
        // data saving
        var trial_data = {
          set_size: trial.set_size,
          target_present: trial.target_present,
          RT: trial.RT,
          response: trial.response,
          target_position: trial.target_position,
          distractor_positions: trial.distractor_positions,
					jitter: trial.jitter
        };

        // end trial
        jsPsych.finishTrial(trial_data);
      }
		}

		p.keyPressed = function() {
				// it's only possible to query the key code once for each key press,
				// so saving it as a variable here:
				var key_code = p.keyCode
				// only regard relevant key presses during the response phase
				if (trial.status=='collecting response' &&
						trial.choices.includes(String.fromCharCode(key_code).toLowerCase())) {
					trial.response = String.fromCharCode(key_code).toLowerCase();
					trial.RT = p.millis()-trial.fixation_duration;
				}
			}

		}


		// start sketch!
		let myp5 = new p5(sketch);
}
//

//Return the plugin object which contains the trial
return plugin;
})();
