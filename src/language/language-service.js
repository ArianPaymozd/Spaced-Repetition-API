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

  async insertNewLinkedList(db, ll) {
		for (let i = 0; i < ll.length; i++) {
			await db('word').where('id', '=', ll[i].id).update(ll[i]);
		}
		return;
	},

  async makeLinkedlist(db, language_id, list, head) {
    const arr = await db
      .from('word')
      .select(
        'id',
        'language_id',
        'original',
        'translation',
        'next',
        'memory_value',
        'correct_count',
        'incorrect_count'
      )
      .where({ language_id });

    let node = arr.find(word => word.id === head)
    while (node.next !== null) {
      list.insertLast(node)
      node = arr.find(word => word.id === node.next)
    }

    return arr;
  },

  async updateLanguageTotalScore(db, language) {
    await db('language')
      .where('user_id', '=', language.user_id)
      .update(language);
  },
}

module.exports = LanguageService
