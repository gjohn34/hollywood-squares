function adderPromise(x, y) {
    return new Promise((res, rej) => {
        res(x + y)
    })
}

adderPromise(1, 2)

    .then(result => {
        console.log(`result 1: ${result}`);
        return adderPromise(result, 3)
    })
    .then(result => {
        console.log(`result 2: ${result}`)
    })
    .then(() => console.log('chained after then with no result'))
    .catch(err => console.error(err));