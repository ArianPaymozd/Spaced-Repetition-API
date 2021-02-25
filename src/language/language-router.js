const express = require('express')
const LanguageService = require('./language-service')
const { requireAuth } = require('../middleware/jwt-auth')
const LinkedList = require('../LinkedList')

const languageRouter = express.Router()
const jsonBodyParser = express.json()
const List = new LinkedList()

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
        req.language.id
      )
      const response = {
        nextWord: word.original,
        totalScore: parseInt(correctTotal[0].sum),
        wordCorrectCount: word.correct_count,
        wordIncorrectCount: word.incorrect_count,
      }
      res.json(response).end()
      next()
    } catch (error) {
      next(error)
    }
  })

languageRouter
  .post('/guess', jsonBodyParser, async (req, res, next) => {
    const words = await LanguageService.getLanguageWords(
        req.app.get('db'),
        req.language.id
    )
    words.reverse().forEach(word => {
      List.insertFirst(word)
    })
    const { guess } = req.body
    const { value } = List.head
    const head = List.head
    if (guess === value.translation) {
      value.memory_value = value.memory_value * 2
      value.correct_count++
      const total = await LanguageService.getTotalCorrect(
        req.app.get('db'),
        req.language.id
      )
      res.json({
        answer: value.translation,
        isCorrect: true,
        nextWord: head.next.value.original,
        totalScore: parseInt(total[0].sum) + 1,
        wordCorrectCount: value.correct_count,
        wordIncorrectCount: value.incorrect_count
      })
      List.insertAt(value, value.memory_value + 1)
      List.head = List.head.next
    } else {
      value.memory_value = 1
      value.incorrect_count++
      const total = await LanguageService.getTotalCorrect(
        req.app.get('db'),
        req.language.id
      )
      res.json({
        answer: value.translation,
        isCorrect: false,
        nextWord: head.next.value.original,
        totalScore: parseInt(total[0].sum),
        wordCorrectCount: value.correct_count,
        wordIncorrectCount: value.incorrect_count
      })
      List.insertAfter(value, head.next.value)
      List.head = List.head.next
    }
    LanguageService.insertNewLinkedList(
      req.app.get('db'),
      List
    )
    List.head = null
  })

module.exports = languageRouter
