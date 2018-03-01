import Route from '@ember/routing/route'
import { task } from 'ember-concurrency'
import computed from 'ember-macro-helpers/computed'

export default Route.extend({
    timerTask: task(function * () {
        
    }),


});
