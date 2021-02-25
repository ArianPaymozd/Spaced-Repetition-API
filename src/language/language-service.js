const LanguageService = {
  getUsersLanguage(db, user_id) {
    return db
      .from('language')
      .select(
        'language.id',
        'language.name',
        'language.user_id',
        'language.head',
        'language.total_score',
      )
      .where('language.user_id', user_id)
      .first()
  },

  getLanguageWords(db, language_id) {
    return db
      .from('word')
      .select(
        'id',
        'language_id',
        'original',
        'translation',
        'next',
        'memory_value',
        'correct_count',
        'incorrect_count',
      )
      .where({ language_id })
  },

  getNextWord(db, language_id) {
    return db
      .from('word')
      .select(
        'id',
        'original',
        'translation',
        'memory_value',
        'correct_count',
        'incorrect_count',
      )
      .where({ language_id })
      .first()
  },

  getTotalCorrect(db, language_id) {
    return db 
      .from('word')
      .sum('correct_count')
      .where({ language_id })
  },

	async insertNewLinkedList(db, list) {
    let currNode = list.head
		while (currNode.next !== null) {
			await db('word').where('id', '=', currNode.value.id).update(currNode.value);
      currNode = currNode.next
		}
    if (currNode.next == null) {
      await db('word').where('id', '=', currNode.value.id).update(currNode.value);
    }
		return;
	},
}

module.exports = LanguageService
