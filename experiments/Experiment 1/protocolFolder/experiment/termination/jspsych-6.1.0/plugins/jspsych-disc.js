jsPsych.plugins["disc"] = (function() {

var plugin = {};

plugin.info = {
  name: 'disc',
  parameters: {
    stimulus1_function: {
        type: jsPsych.plugins.parameterType.FUNCTION,
        pretty_name: "stimulus_function",
        default: (p,t,du) => {p.noFill(); p.strokeWeight(2); p.stroke(255); p.rect(0,0,du/10,du/10)}
    },
    stimulus2_function: {
        type: jsPsych.plugins.parameterType.FUNCTION,
        pretty_name: "stimulus_function",
        default: (p,t,du) => {p.noFill(); p.strokeWeight(2); p.stroke(255); p.circle(0,0,du/10)}
    },
    mask_function: {
        type: jsPsych.plugins.parameterType.FUNCTION,
        pretty_name: "mask_function",
        default: (p,t,du) => {p.push(); p.fill(255); p.rect(0,0,du/5,du/5); p.pop()}
    },
    stim_duration: {
      type: jsPsych.plugins.parameterType.FLOAT,
      pretty_name: "stim duration",
      default: 50,
      description: "Duration of stimulus mask in milliseconds"
    },
    SOA: {
      type: jsPsych.plugins.parameterType.FLOAT,
      pretty_name: "SOA",
      default: 30,
      description: "Duration of prestimulus mask in milliseconds"
    },
    mask_duration: {
      type: jsPsych.plugins.parameterType.FLOAT,
      pretty_name: "mask duration",
      default: 100,
      description: "Duration of mask in milliseconds"
    },
    mask_2_duration: {
      type: jsPsych.plugins.parameterType.FLOAT,
      pretty_name: "mask2 duration",
      default: 100,
      description: "Duration of poststimulus mask in milliseconds"
    },
    which_stimulus: {
      type: jsPsych.plugins.parameterType.INT,
      pretty_name: "Which stimulus (1 or 2)",
      default: 1
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
      description: "Choice keys",
      default: ['f','j']
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
      description: "Maximum diameter of confidence circle in du",
      default: 0.8
    },
    min_conf_d: {
      type: jsPsych.plugins.parameterType.FLOAT,
      pretty_name: "Minimum diameter of confidence circle",
      description: "Minimum diameter of confidence circle in du",
      default: 0.1
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

    const du = p.min([window.innerWidth, window.innerHeight, 600])*7/10 //drawing unit
    //sketch setup
    p.setup = function() {
    p.createCanvas(window.innerWidth, window.innerHeight);
    p.background(128); //gray
    p.strokeWeight(0);
    p.noCursor();

    //initialize some variables:
    trial.lff = 0; // last fixation frame
    trial.conf_time = Infinity //initialize to infinity (ugly hack, sorry)
  };

  function presentFixationCross() {
    p.background(128);
    p.fill(255)
    p.rectMode(p.CENTER)
    p.rect(0, 0, 24, 2);
    p.rect(0, 0, 2, 24);
    trial.lff = p.frameCount; //last fixation frame
  }


  // this is here just for good order, basically it's calling presentChoices
  function collectResponse() {
    p.push()
    p.translate(-du/3,0)
    trial.stimulus1_function(p,p.millis(),du)
    p.translate(du*2/3,0)
    trial.stimulus2_function(p,p.millis(),du)
    p.pop()

    p.push()
    p.fill(200)
    p.textSize(15)
    p.translate(-du/3,40)
    p.text('press Q',0,0)
    p.translate(du*2/3,0)
    p.text('press W',0,0)
    p.pop()
  }



  function rateConfidence() {
    p.cursor(p.ARROW)
    p.background(128);
    // the radius of the circle is the distance of the cursor from the CENTER
    // of the screen
    trial.distance_from_center = p.sqrt((p.width/2-p.mouseX)**2+
      (p.height/2-p.mouseY)**2)/du
    trial.diameter = p.max(p.min(trial.distance_from_center*2, trial.max_conf_d),
      trial.min_conf_d)
    // the confidence is the normalized diameter
    confidence = (trial.diameter-trial.min_conf_d)/
        (trial.max_conf_d-trial.min_conf_d)
    p.fill(128)
    p.strokeWeight(1)
    p.stroke(255)
    p.circle(0,0, trial.max_conf_d*du)
    //only present the circle if the cursor moved
    if (trial.present_circle==1 && trial.confidence==undefined) {
      // to make the circle red when small and blue when big
      color = [210, 40, 45].map((e,i)=>p.round(e+confidence*[-165,80,165][i]))
      p.fill(color)
      p.strokeWeight(0)
      p.circle(0,0, trial.diameter*du)
    } else if (trial.confidence!==undefined) {
      color = [210, 40, 45].map((e,i)=>p.round(e+trial.confidence*[-165,80,165][i]))
      p.fill(color)
      p.circle(0,0,
        du*(trial.min_conf_d+trial.confidence*(trial.max_conf_d-trial.min_conf_d)))
      p.noFill()
      p.strokeWeight(2)
      p.circle(0,0,
        du*(trial.min_conf_d+trial.confidence*(trial.max_conf_d-trial.min_conf_d)))
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
    show_conf_mapping()
  }

  function show_conf_mapping() {
    p.push()
    p.stroke(255);
    p.strokeWeight(2);
    p.fill(45,120,210)
    p.circle(du*2/3,-du/3,du/6)
    p.fill(210,40,45)
    p.circle(du*2/3,-du/6,du/20)
    p.fill(255)
    p.textSize(60);
    p.textAlign(p.CENTER, p.CENTER)
    p.strokeWeight(0);
    p.textSize(15);
    p.fill(255)
    p.text('Highest confidence',du*2/3, -du/2)
    p.text('Lowest confidence',du*2/3, -du/15)

    p.pop()
  }

  //organize everything in one sequence
  p.draw = function() {
    p.translate(window.innerWidth/2,window.innerHeight/2)
    p.background(128)
    // First, draw fixation cross
    if (p.millis()<trial.fixation_duration) {
      presentFixationCross()
      trial.status = 'presenting fixation'
    } else if (p.millis()<trial.fixation_duration
               +trial.stim_duration){
        if (trial.which_stimulus==1) {
          trial.stimulus1_function(p,p.millis(),du)
        } else if (trial.which_stimulus==2) {
          trial.stimulus2_function(p,p.millis(),du)
        }
        trial.status = 'stimulus'
      } else if (p.millis()<trial.fixation_duration
             +trial.stim_duration
             +trial.SOA) {
      trial.status = 'SOA'
      } else if (p.millis()<trial.fixation_duration
             +trial.stim_duration
             +trial.SOA
             +trial.mask_duration) {
      trial.mask_function(p,p.millis(),du)
      trial.status = 'mask'
      } else if (!trial.hasOwnProperty('response')){
        presentFixationCross()
        collectResponse()
        trial.status = 'collecting response'
      } else if (p.millis()<trial.fixation_duration
                +p.max(trial.confidence_duration,(trial.conf_time+200)) &&
                  trial.rate_confidence) {
        rateConfidence()
        trial.status = 'collecting confidence'
      } else { //trial ended
        p.remove()
        // data saving
        var trial_data = {
          which_stimulus: trial.which_stimulus,
          RT: trial.RT,
          response: trial.response,
          confidence: trial.confidence,
          conf_RT: trial.conf_RT,
          SOA: trial.SOA
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
        trial.click_time = p.millis()
      }
    }

    p.mouseClicked = function() {
      // only check mouse clicks during the confidence phase
      if (trial.status=='collecting confidence' && trial.present_circle == 1) {
        trial.confidence = (trial.diameter-trial.min_conf_d)/
            (trial.max_conf_d-trial.min_conf_d);
        trial.conf_RT = p.millis()-trial.RT-trial.fixation_duration;
        trial.conf_time = p.millis()
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
0
