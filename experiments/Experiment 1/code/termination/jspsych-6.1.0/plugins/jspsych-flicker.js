jsPsych.plugins["flicker"] = (function() {

	var plugin = {};

	plugin.info = {
		name: 'Flicker',
		parameters: {
			num_frames: {
				type: jsPsych.plugins.parameterType.INT,
				pretty_name: "Number of frames",
				default: 12,
				description: "The number of stimulus frames"
			},
			frame_rate: {
				type: jsPsych.plugins.parameterType.INT,
				pretty_name: "Frame rate",
				default: 25,
				description: "Frame rate (Hz)"
			},
			detection: {
				type: jsPsych.plugins.parameterType.BOOL,
				pretty_name: "Detection",
				default: false,
				description: "Task (discrimination or detection; default discrimination)"
			},
			signal_presence: {
				type: jsPsych.plugins.parameterType.BOOL,
				pretty_name: "Signal presence",
				default: true,
				description: "Signal presence or absence; default presence"
			},
			bright_side: {
				type: jsPsych.plugins.parameterType.STRING,
				pretty_name: "Bright side",
				default: 'right',
				description: "The lighter side (left or right)"
			},
			delta: {
				type: jsPsych.plugins.parameterType.FLOAT,
				pretty_name: "Delta",
				default: 5,
				description: "Mean difference in brightness"
			},
			std: {
				type: jsPsych.plugins.parameterType.FLOAT,
				pretty_name: "STD",
				default: 10,
				description: "Standard deviation of brightness levels"
			},
			fixation_duration: {
				type: jsPsych.plugins.parameterType.FLOAT,
				pretty_name: "Fixation duration",
				default: 500,
				description: "Duration of fixation in milliseconds"
			},
			choices: {
				type: jsPsych.plugins.parameterType.STRING,
				pretty_name: "Choices",
				description: "Choice keys"
			},
			confidence_duration: {
				type: jsPsych.plugins.parameterType.FLOAT,
				pretty_name: "Confidence duration",
				description: "Minimum duration of confidence phase in milliseconds",
				default: 2000
			},
			max_conf_d: {
				type: jsPsych.plugins.parameterType.FLOAT,
				pretty_name: "Maximum diameter of confidence circle",
				description: "Maximum diameter of confidence circle in pixels",
				default: 400
			},
			min_conf_d: {
				type: jsPsych.plugins.parameterType.FLOAT,
				pretty_name: "Minimum diameter of confidence circle",
				description: "Minimum diameter of confidence circle in pixels",
				default: 55
			},
			rate_confidence: {
				type: jsPsych.plugins.parameterType.BOOL,
				default: true
			},
			give_confidence_feedback: {
			default: false
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
			p.background(128); //gray
			p.strokeWeight(0);
			p.frameRate(trial.frame_rate);
			p.noCursor();

			// get the luminance of the right and left squares as a function of trial
			// parameters:
			trial.luminance = [[[],[],[],[]],[[],[],[],[]]] //left,right
			for (i=0; i<trial.num_frames; i++) {
				for (j=0; j<4; j++) {
						if (trial.bright_side=='right' && trial.signal_presence) {
							trial.luminance[0][j][i] = p.round(p.randomGaussian(128,trial.std))
							trial.luminance[1][j][i] = p.round(p.randomGaussian(128+trial.delta,trial.std))
					} else if (trial.bright_side=='left' && trial.signal_presence){
						trial.luminance[0][j][i] = p.round(p.randomGaussian(128+trial.delta,trial.std))
						trial.luminance[1][j][i] = p.round(p.randomGaussian(128,trial.std))
					} else if (trial.signal_presence==false) {
						trial.luminance[0][j][i] = p.round(p.randomGaussian(128,trial.std))
						trial.luminance[1][j][i] = p.round(p.randomGaussian(128,trial.std))
					}
				}
			}

			//initialize some variables:
			trial.lff = 0; // last fixation frame
			trial.conf_RT = Infinity //initialize to infinity (ugly hack, sorry)
		};

		function presentFixationCross() {
			p.background(128);
			p.fill(255)
			p.rect(p.width/2-12, p.height/2-2, 24, 4);
			p.rect(p.width/2-2, p.height/2-12, 4, 24);
			trial.lff = p.frameCount; //last fixation frame
		}

		function presentStimulus() {
			p.background(128);

			for (j=0; j<4; j++) { //iterate over squares: external to internal
				// draw left squares
				p.fill(trial.luminance[0][j][p.frameCount-trial.lff]);
				p.rect(p.width/2-139+(j*14), p.windowHeight/2-25, 14, 56);
				// draw right squares
				p.fill(trial.luminance[1][j][p.frameCount-trial.lff]);
				p.rect(p.width/2+139-(j*14), p.windowHeight/2-25, 14, 56);
			}
			p.fill(255)
			p.rect(p.width/2-12, p.height/2-2, 24, 4);
			p.rect(p.width/2-2, p.height/2-12, 4, 24);
		}

		// this is here just for good order, basically it's calling presentChoices
		function collectResponse() {
			p.background(128);
			presentChoices()
		}

		// a function to present the two choices, with changing background as a
		// function of response
		function presentChoices() {

			// locations are vertical in detection and horizontal in discrimination
			if (trial.detection) {
				var loc = [[p.width/2, p.width/2],[p.height/2-25,p.height/2+25]]
			} else {
				var loc = [[p.width/2-25, p.width/2+25],[p.height/2,p.height/2]]
			}
			p.textSize(30);
			p.textAlign(p.CENTER,p.CENTER)
			for (i_choice=0; i_choice<2; i_choice++) {
				if (trial.response==undefined || trial.response == trial.choices[i_choice]) {
					p.fill(150);
					p.stroke(255);
					p.strokeWeight(1);
					p.rect(loc[0][i_choice]-25, loc[1][i_choice]-25, 50, 50);
					p.fill(255);
					p.text(trial.choices[i_choice].toUpperCase(),loc[0][i_choice], loc[1][i_choice])
				}
			}
		}


		function rateConfidence() {
			p.cursor(p.ARROW)
			p.background(128);
			// the radius of the circle is the distance of the cursor from the CENTER
			// of the screen
			trial.distance_from_center = p.sqrt((p.width/2-p.mouseX)**2+
				(p.height/2-p.mouseY)**2)
			trial.diameter = p.max(p.min(trial.distance_from_center*2, trial.max_conf_d),
				trial.min_conf_d)
			// the confidence is the normalized diameter
			confidence = (trial.diameter-trial.min_conf_d)/
					(trial.max_conf_d-trial.min_conf_d)
			p.fill(128)
			p.strokeWeight(1)
			p.circle(p.width/2,p.height/2, trial.max_conf_d)
			//only present the circle if the cursor moved
			if (trial.present_circle==1 && trial.confidence==undefined) {
				// to make the circle red when small and blue when big
				color = [210, 40, 45].map((e,i)=>p.round(e+confidence*[-165,80,165][i]))
				p.fill(color)
				p.strokeWeight(0)
				p.circle(p.width/2,p.height/2, trial.diameter)
			} else if (trial.confidence!==undefined) {
				color = [210, 40, 45].map((e,i)=>p.round(e+trial.confidence*[-165,80,165][i]))
				p.fill(color)
				p.circle(p.width/2,p.height/2,
					trial.min_conf_d+trial.confidence*(trial.max_conf_d-trial.min_conf_d))
				p.noFill()
				p.strokeWeight(2)
				p.circle(p.width/2,p.height/2,
					trial.min_conf_d+trial.confidence*(trial.max_conf_d-trial.min_conf_d))
				// if (trial.give_confidence_feedback) {
				// 	switch(p.round(trial.confidence*5)) {
				// 		case 0:
				// 			var message = 'guessing';
				// 			break;
				// 		case 1:
				// 			var message = 'not confident';
				// 			break;
				// 		case 2:
				// 			var message = 'somewhat confident';
				// 			break;
				// 		case 3:
				// 			var message = 'pretty confident';
				// 			break;
				// 		case 4:
				// 			var message = 'confident';
				// 			break;
				// 		case 5:
				// 			var message = 'highly confident'
				// 			break;
				// 	}
				// 	p.push()
				// 	p.strokeWeight(3);
				// 	p.fill(color)
				// 	p.textSize(33)
				// 	p.textFont('Quicksand')
				// 	p.textStyle(p.BOLD)
				// 	p.textAlign(p.CENTER,p.CENTER)
				// 	p.text(message, p.width/2, p.height/2)
				// 	p.pop()
				// }
			}
			if (trial.give_confidence_feedback) {
				show_conf_mapping()
			}
		}

		function show_conf_mapping() {
			p.push()
			p.stroke(255);
			p.strokeWeight(2);
			p.fill(45,120,210)
			p.circle(p.width/2+400,p.height/2-150,80)
			p.fill(210,40,45)
			p.circle(p.width/2+400,p.height/2-80,20)
			p.fill(255)
			p.textSize(60);
			p.textAlign(p.CENTER, p.CENTER)
			p.strokeWeight(0);
			p.textSize(15);
			p.fill(0)
			p.text('Highest confidence',p.width/2+400, p.height/2-200)
			p.text('Lowest confidence',p.width/2+400, p.height/2-50)

			p.pop()
		}

		//organize everything in one sequence
		p.draw = function() {

			// First, draw fixation cross
			if (p.millis()<trial.fixation_duration) {
				presentFixationCross()
				trial.status = 'presenting fixation'
			} else if (p.frameCount<trial.num_frames+trial.lff) {
					presentStimulus()
					trial.status = 'presenting stimulus'
				} else if (trial.response==undefined) {
					collectResponse()
					trial.status = 'collecting response'
				} else if (p.millis()-trial.RT-trial.fixation_duration <
										p.max(trial.conf_RT+500, trial.confidence_duration) &&
										trial.rate_confidence) {
					rateConfidence()
					trial.status = 'collecting confidence'
				} else { //trial ended
					p.remove()
					// data saving
					var trial_data = {
						bright_side: trial.bright_side,
						signal_presence: trial.signal_presence,
						detection: trial.detection,
						RT: trial.RT,
						response: trial.response,
						confidence: trial.confidence,
						conf_RT: trial.conf_RT,
						luminance: trial.luminance
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

			p.mouseClicked = function() {
				// only check mouse clicks during the confidence phase
				if (trial.status=='collecting confidence' && trial.present_circle == 1) {
					trial.confidence = (trial.diameter-trial.min_conf_d)/
							(trial.max_conf_d-trial.min_conf_d);
					trial.conf_RT = p.millis()-trial.RT-trial.fixation_duration;
				}
			}

			// only present confidence circle after the mouse has moved
			p.mouseMoved = function() {
				if (trial.status=='collecting confidence') {
					trial.present_circle = 1
				}
			}
		};

		// start sketch!
		let myp5 = new p5(sketch);

}

//Return the plugin object which contains the trial
return plugin;
})();
