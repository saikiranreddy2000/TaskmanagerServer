const VALID_TRANSITIONS = {
  TODO:        ['IN_PROGRESS', 'BLOCKED'],
  IN_PROGRESS: ['IN_REVIEW', 'BLOCKED'],
  IN_REVIEW:   ['DONE', 'BLOCKED'],
  BLOCKED:     ['IN_PROGRESS'],
  DONE:        []
};

module.exports = VALID_TRANSITIONS;