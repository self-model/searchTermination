/*
 * Example plugin template
 */

jsPsych.plugins["preRNG"] = (function() {

  var plugin = {};

  plugin.info = {
    name: "preRNG",
    parameters: {
      protocol_sum: {
        type: jsPsych.plugins.parameterType.STRING,
        default: undefined
      },
      subject_identifier: {
        type: jsPsych.plugins.parameterType.STRING,
        default: undefined
      }
    }
  }

  plugin.trial = function(display_element, trial) {


  function hexToBytes(hex) {
      for (var bytes = [], c = 0; c < hex.length; c += 2)
      bytes.push(parseInt(hex.substr(c, 2), 16));
      return bytes;
  }

  trial.subject_sum = CryptoJS.SHA256(trial.protocol_sum+trial.subj_id).toString();
  var m = new MersenneTwister();
  Math.random = function() {return m.random()};
  m.init_by_array(hexToBytes(trial.protocol_sum), hexToBytes(trial.protocol_sum).length)
  var first_random = Math.random()
  m.init_by_array(hexToBytes(trial.subject_sum), hexToBytes(trial.subject_sum).length)
  var second_random = Math.random()
  m.init_by_array(hexToBytes(trial.protocol_sum), hexToBytes(trial.protocol_sum).length)

    // data saving
    var trial_data = {
      protocol_sum: trial.protocol_sum,
      subject_identifier: trial.subject_identifier,
      subject_sum: trial.subject_sum,
      first_random: first_random,
      second_random: second_random,
      url_params: jatos.urlQueryParameters.PROLIFIC_PID
    };

    // end trial
    jsPsych.finishTrial(trial_data);
  };

  return plugin;
})();
