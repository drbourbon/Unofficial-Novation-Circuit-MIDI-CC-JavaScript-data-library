var helpers = require('./helpers.js'),
  synth = require('./novation-circuit-synth.js'),
  drum = require('./novation-circuit-drums.js'),
  session = require('./novation-circuit-session.js'),
  allMidiCCs = require('./novation-circuit-midi-ccs.js');

(function() {
  var midiCCs = allMidiCCs.midiCCs,
    midiComponents = new Map(),
    midiDrumCCs = getDrumComponents(drum.midiComponents),
    midiChannels = {
      '0': 'synth 1',
      '1': 'synth 2',
      '9': 'drum',
      '15': 'session'
    };

  midiComponents.set('synth 1', getComponentSettings(0,synth.midiComponents));
  midiComponents.set('synth 2', getComponentSettings(1,synth.midiComponents));
  midiComponents.set('drum 1', getComponentSettings(9,drum.midiComponents[0]));
  midiComponents.set('drum 2', getComponentSettings(9,drum.midiComponents[1]));
  midiComponents.set('drum 3', getComponentSettings(9,drum.midiComponents[2]));
  midiComponents.set('drum 4', getComponentSettings(9,drum.midiComponents[3]));
  midiComponents.set('session', getComponentSettings(15,session.midiComponents));

  function getDrumComponents(drumComponents) {
    var drumComponentsArray = [];
    drumComponents.forEach(function(component) {
      drumComponentsArray.push(component.settings);
    });

    return drumComponentsArray;
  }

  function getComponentSettings(midiChannel, midiCCObject) {
    var midiCCObjectKeys = Object.keys(midiCCObject),
      componentSettings = new Map();

    midiCCObjectKeys.forEach(function(key) {
      componentSettings.set( key, getMidiSettings(midiChannel, midiCCObject[key]) );
    });

    return componentSettings;
  }

  function getMidiSettings(midiChannel, midiCCArray) {
    var midiCCArrayLength = midiCCArray.length,
      midiSettings = [];

    for (var i=0; i<midiCCArrayLength; i++) {
      var thisSetting = helpers.getCircuitMidiCC(midiChannel, midiCCArray[i]);

      midiSettings[midiCCArray[i]] = thisSetting;
    }

    return midiSettings;
  }

  function getMidiComponents(components) {
    var defaultPatch = new Map();

    components.forEach(function(value, key) {
      var componentValues = new Map();

      value.forEach(function(v, k) {
        var midiParameters = Object.keys(v),
          componentArray = [],
          componentType = "";

        midiParameters.forEach(function(parameter) {
          if (!componentType) {
            componentType = k;
          }

          componentArray.push({
            'cc': parameter,
            'name': getMidiParameterName(v[parameter]),
            'default': getMidiParameterDefault(v[parameter]),
            'range': getMidiParameterRange(v[parameter])
          });
        });

        componentValues.set( componentType, componentArray );
        defaultPatch.set( key, componentValues );
      });
    });

    return defaultPatch;
  }

  function getMidiParameterName(parameter) {
    return parameter['name'] ? parameter['name'] : false;
  }

  function getMidiParameterDefault(parameter) {
    return parameter['default'] ? parameter['default'] : false;
  }

  function getMidiParameterRange(parameter) {
    var range = parameter['range'] ? parameter['range'] : false,
      rangeValues = parameter['rangeValues'] ? parameter['rangeValues'] : false;

    if (rangeValues) {
      return getRangeValues(range, rangeValues);
    } else {
      return getRange(range);
    }
  }

  function getRangeValues(range, rangeValues) {
    var values = {},
      rangeStart = range[0],
      rangeValuesStart = rangeValues[0],
      rangeValuesType = typeof(rangeValues[0]),
      rangeLength = range[1] - range[0];

    for(var i=0; i<rangeLength+1; i++) {
      values[rangeStart+i] = rangeValuesType === 'number' ? rangeValuesStart+i : rangeValues[i];
    }

    return values;
  }

  function getRange(range) {
    var values = {},
      rangeValuesStart = range[0]
      rangeLength = range[1];

    for(var i=0; i<rangeLength+1; i++) {
      values[rangeValuesStart+i] = rangeValuesStart+i;
    }

    return values;
  }

  module.exports = {
    midiCCs: midiCCs,
    midiComponents: getMidiComponents(midiComponents),
    midiDrumCCs: midiDrumCCs,
    midiChannels: midiChannels
  };

})();
