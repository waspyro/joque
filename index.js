export default class Joque {
  #freeJobs = []
  #freeWorkers = []

  getState() {
    return [this.#freeWorkers.length, this.#freeJobs.length]
  }

  add(jobData) {
    return new Promise((resolve, reject) => {
      const job = {data: jobData, resolve, reject}
      if(this.#freeWorkers.length)
        return this.#freeWorkers.shift()(job)
      this.#freeJobs.push(job)
    })
  }

  take(resolver, clones = 1) {
    while(clones--) {
      const repeater = time => setTimeout(this.take.bind(this, resolver), time)
      const job = this.#freeJobs.shift()
      if (job) resolver(job, repeater)
      else this.#freeWorkers.push(job => resolver(job, repeater))
    }
    return this
  }

}

class DefaultedMap extends Map {
  #defaultValueSetter
  constructor(defaultValueSetter) {
    super();
    this.#defaultValueSetter = defaultValueSetter
  }

  get(key) {
    return this.has(key)
      ? super.get(key)
      : this.set(key, this.#defaultValueSetter()).get(key)
  }
}

export class JoqueManager {
  #queues = new DefaultedMap(() => new Joque)

  getState() {
    return Array.from(this.#queues.entries()).map(e => [e[0], e[1].getState()])
  }

  add(jobName, jobPayload) {
    return this.#queues.get(jobName).add(jobPayload)
  }

  take(jobName, resolver) {
    return this.#queues.get(jobName).take(resolver)
  }

}
