export default class Joque {
  #freeJobs = []
  #freeWorkers = []

  getState() {
    return this.#freeJobs.length - this.#freeWorkers.length
  }

  add(jobData) {
    return new Promise((resolve, reject) => {
      const job = {data: jobData, resolve, reject}
      if(this.#freeWorkers.length)
        return this.#freeWorkers.shift()(job)
      this.#freeJobs.push(job)
    })
  }

  take(resolver) {
    const job = this.#freeJobs.shift()
    if(job) resolver(job)
    else this.#freeWorkers.push(resolver)
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
