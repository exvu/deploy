
class Log {
    start(text: string) {
        console.log(text)
        return this;
    }
    next(text: string) {
        console.log(text)
        return this;
    }
    fail(text: string) {
        console.log(text)
        return this;
    }
    succeed(text: string) {
        console.log(text);
        return this;
    }
    stop() {
        return this;
    }
    info(text: string) {
        console.log(text);
        return this;
    }
}
export default () => {
    return new Log();
}