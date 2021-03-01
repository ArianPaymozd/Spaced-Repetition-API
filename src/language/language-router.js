const express = require('express')
const LanguageService = require('./language-service')
const { requireAuth } = require('../middleware/jwt-auth')
const LinkedList = require('../LinkedList')

const languageRouter = express.Router()
const jsonBodyParser = express.json()

languageRouter
  .use(requireAuth)
  .use(async (req, res, next) => {
    try {
      const language = await LanguageService.getUsersLanguage(
        req.app.get('db'),
        req.user.id,
      )

      if (!language)
        return res.status(404).json({
          error: `You don't have any languages`,
        })

      req.language = language
      next()
    } catch (error) {
      next(error)
    }
  })

languageRouter
  .get('/', async (req, res, next) => {
    try {
      const words = await LanguageService.getLanguageWords(
        req.app.get('db'),
        req.language.id,
      )
      res.json({
        language: req.language,
        words,
      })
      next()
    } catch (error) {
      next(error)
    }
  })

languageRouter
  .get('/head', async (req, res, next) => {
    try {
      const correctTotal = await LanguageService.getTotalCorrect(
        req.app.get('db'),
        req.language.id
      )
      const word = await LanguageService.getNextWord(
        req.app.get('db'),
        req.language.head
      )
      console.log(word)
      const response = {
        nextWord: word[0].original,
        totalScore: parseInt(correctTotal[0].sum),
        wordCorrectCount: word[0].correct_count,
        wordIncorrectCount: word[0].incorrect_count,
      }
      res.json(response).end()
      next()
    } catch (error) {
      next(error)
    }
  })

  languageRouter
  .post('/guess', jsonBodyParser, async (req, res, next) => {
    try {
      const { guess } = req.body

      if (!guess) {
        return res.status(400).send({
          error: `Missing 'guess' in request body`
        })
      }

      const List = new LinkedList()

      await LanguageService.makeLinkedlist(
        req.app.get('db'),
        req.language.id,
        List,
        req.language.head
      )

      const language = req.language

      let response = {
        answer: List.head.value.translation,
        nextWord: List.head.next.value.original,
        totalScore: language.total_score,
        wordCorrectCount: List.head.next.value.correct_count,
        wordIncorrectCount: List.head.next.value.incorrect_count,
        isCorrect: false,
      }

      if (guess == List.head.value.translation) {
        language.total_score += 1
        response.totalScore += 1
        List.head.value.correct_count += 1
        List.head.value.memory_value *= 2
        response = { ...response, isCorrect: true }
      } else {
        List.head.value.incorrect_count += 1
        List.head.value.memory_value = 1
        response = { ...response, isCorrect: false }
      }

      let memVal = List.head.value.memory_value

      store = List.head

      while (store.next !== null && memVal > 0) {
        let translation = store.value.translation
        let original = store.value.original
        let correct_count = store.value.correct_count
        let incorrect_count = store.value.incorrect_count
        let memory_value = store.value.memory_value

        store.value.translation = store.next.value.translation
        store.value.original = store.next.value.original
        store.value.correct_count = store.next.value.correct_count
        store.value.incorrect_count = store.next.value.incorrect_count
        store.value.memory_value = store.next.value.memory_value

        store.next.value.translation = translation
        store.next.value.original = original
        store.next.value.correct_count = correct_count
        store.next.value.incorrect_count = incorrect_count
        store.next.value.memory_value = memory_value
        store = store.next
        memVal--
      }

      language.head = List.head.value.id

      let list = List.head

      let arr = []

      while (list) {
        arr.push(list.value)
        list = list.next
      }

      LanguageService.insertNewLinkedList(req.app.get('db'), arr)
      LanguageService.updateLanguageTotalScore(req.app.get('db'), language)

      return res.json(response)
    } catch (error) {
      next(error)
    }
  })

module.exports = languageRouter
