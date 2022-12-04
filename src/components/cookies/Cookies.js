import {Cookies} from 'react-cookie'

/*
*  This is the cookie helper class.
*  It is responsible for setting and getting cookies.
* */

const cookies = new Cookies()

export const setCookie = (name, value, options) => {
    return cookies.set(name, value, {...options})
}

export const getCookie = (name) => {
    return cookies.get(name)
}
