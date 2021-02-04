export const FIELDS = {
  trained_coach: '430799',
  trained_mentor: '430800',
  can_assign_mentors: '430803',
  can_assign_coaches: '430804',
  can_close_coaching_relationships: '430805',
  has_app_access: '430983',
};

export const getFieldId = (field: keyof typeof FIELDS) => FIELDS[field];
export const getFieldName = (id: string): keyof typeof FIELDS => {
  const invertedMap = Object.keys(FIELDS).reduce((acc, key) => {
    acc[FIELDS[key]] = key;
    return acc;
  }, {});
  return invertedMap[id];
};
