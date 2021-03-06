(function (app) {
'use strict';

let TemperatureUnits = {
  CELCIUS: 'c',
  FAHRENHEIT: 'f',
};

let keys = {
  ALWAYS_SHOW_BOOKMARKS: 'alwaysShowBookmarks',
  BOOKMARKS_DRAWER_SMALL: 'bookmarksDrawerSmall',
  BOXED_INFO: 'boxedInfo',
  SHOW_WEATHER: 'showWeather',
  TEMPERATURE_UNIT: 'temperatureUnit',
  USE_TIME_OF_DAY_IMAGES: 'useTimeOfDayImages',
};

// The default values of each setting if they are not saved in storage.
let _defaults = {
  [keys.ALWAYS_SHOW_BOOKMARKS]: false,
  [keys.BOOKMARKS_DRAWER_SMALL]: true,
  [keys.BOXED_INFO]: true,
  [keys.SHOW_WEATHER]: true,
  [keys.TEMPERATURE_UNIT]: TemperatureUnits.FAHRENHEIT,
  [keys.USE_TIME_OF_DAY_IMAGES]: false,
};

// Listeners attached to particular settings that set or unset overrides on
// other settings.
let _overrides = {
  [keys.ALWAYS_SHOW_BOOKMARKS]: value => {
    if (!value) {
      _setOverride(keys.BOOKMARKS_DRAWER_SMALL, false);
    } else {
      _unsetOverride(keys.BOOKMARKS_DRAWER_SMALL);
    }
  },

  [keys.SHOW_WEATHER]: value => {
    if (!value) {
      _setOverride(keys.TEMPERATURE_UNIT, null);
    } else {
      _unsetOverride(keys.TEMPERATURE_UNIT);
    }
  },
};

let _storageKeysArray = Object.keys(keys).map(keyName => keys[keyName]);

let _data = {};
_storageKeysArray.forEach(storageKey => {
  _data[storageKey] = {
    value: undefined,
    override: undefined,
    basicListener: new chrome.Event(),
    dataListener: new chrome.Event(),
  };

  if (storageKey in _overrides) {
    onChanged(storageKey).addListener(_overrides[storageKey]);
  }
});

let loaded = new Promise(resolve => {
  chrome.storage.sync.get(_storageKeysArray, data => resolve(data));
})
  .then(data => {
    _storageKeysArray.forEach(storageKey => {
      _setValue(storageKey, data[storageKey], true);
    });
  });

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync') {
    Object.keys(changes).forEach(storageKey => {
      _setValue(storageKey, changes[storageKey].newValue);
    });
  }
});

function _setValue(storageKey, newValue, forceNotify = false) {
  const PROP_NAME = 'value';
  _setDataProperty(storageKey, PROP_NAME, newValue, forceNotify);
}

function _setOverride(storageKey, newOverride, forceNotify = false) {
  const PROP_NAME = 'override';
  _setDataProperty(storageKey, PROP_NAME, newOverride, forceNotify);
}

function _unsetOverride(storageKey) {
  _setOverride(storageKey, undefined);
}

function _setDataProperty(storageKey, property, value, forceNotify) {
  let oldData;
  let oldOverriddenValue;
  if (!forceNotify) {
    oldData = getData(storageKey);
    oldOverriddenValue = get(storageKey);
  } else {
    oldData = { value: undefined, override: undefined };
    oldOverriddenValue = undefined;
  }

  let dataItem = _data[storageKey];
  dataItem[property] = value;

  let newData = getData(storageKey);
  if (newData.value !== oldData.value ||
      newData.override !== oldData.override) {
    dataItem.dataListener.dispatch(newData, oldData);
  }

  let newOverriddenValue = get(storageKey);
  if (newOverriddenValue !== oldOverriddenValue) {
    dataItem.basicListener.dispatch(newOverriddenValue, oldOverriddenValue);
  }
}

function get(storageKey) {
  console.assert(_storageKeysArray.indexOf(storageKey) !== -1);
  if (_data[storageKey].override !== undefined) {
    return _data[storageKey].override;
  } else if (_data[storageKey].value !== undefined) {
    return _data[storageKey].value;
  } else {
    return _defaults[storageKey];
  }
}

function getData(storageKey) {
  console.assert(_storageKeysArray.indexOf(storageKey) !== -1);
  let d = _data[storageKey];
  let value = d.value;
  if (value === undefined) {
    value = _defaults[storageKey];
  }

  return { value, override: d.override };
}

function set(storageKey, value) {
  console.assert(_storageKeysArray.indexOf(storageKey) !== -1);
  chrome.storage.sync.set({ [storageKey]: value });
}

function onChanged(storageKey) {
  console.assert(_storageKeysArray.indexOf(storageKey) !== -1);
  return _data[storageKey].basicListener;
}

function onDataChanged(storageKey) {
  console.assert(_storageKeysArray.indexOf(storageKey) !== -1);
  return _data[storageKey].dataListener;
}

app.settings = {
  TemperatureUnits,
  keys,
  loaded,
  get,
  getData,
  set,
  onChanged,
  onDataChanged,
};

})(window.app = window.app || {});
