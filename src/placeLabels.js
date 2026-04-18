const TYPE_LABELS_FI = {
  country: 'maa',
  ocean: 'meri',
  city: 'kaupunki',
  lake: 'järvi',
  mountainRange: 'vuoristo',
  peninsula: 'niemimaa',
  desert: 'aavikko',
};

export function placeNameFi(place) {
  return place.nameFi ?? place.name;
}

export function placeNamePair(place) {
  const fi = placeNameFi(place);
  return fi === place.name ? fi : `${fi} / ${place.name}`;
}

export function placeTypeFi(type) {
  return TYPE_LABELS_FI[type] ?? type;
}
