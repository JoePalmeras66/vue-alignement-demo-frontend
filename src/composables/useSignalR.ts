import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr'
import { RetryContext } from '@microsoft/signalr/src/IRetryPolicy'
import { useCookies } from 'vue3-cookies'

// try to reconnect immediately, after 3, 6, 9 seconds, then every 10 seconds
const retryTimes = [0, 3000, 6000, 9000, 10000]

export const useSignalR = () => {
  /**
   * reads the cookie with the given name XSRF-TOKEN and returns it
   */
  const fetchXsrfToken = () => {
    const { cookies } = useCookies()

    if (cookies.get('XSRF-TOKEN')) {
      return cookies.get('XSRF-TOKEN')
    } else {
      return ''
    }
  }

  /**
   * Configures the SignalR reconnect policy, which can be customized in the retryTimes array.
   * @param context
   */
  const fetchRetryTimes = (context: RetryContext) => {
    const index =
      context.previousRetryCount < retryTimes.length
        ? context.previousRetryCount
        : retryTimes.length - 1
    return retryTimes[index]
  }

  /**
   * create a signalR connection to the server with an url a method call and a serverevent listener
   * @param url the url to the signalR server
   * @param method the method to call on the server
   * @param args the arguments to pass to the method
   */
  const createSignalRConnection = (
    url: string,
    method: string,
    ...args: any[]
  ): HubConnection => {
    const xsrfToken = fetchXsrfToken()

    const connection = new HubConnectionBuilder()
      .withAutomaticReconnect({ nextRetryDelayInMilliseconds: fetchRetryTimes })
      .withUrl(url, {
        headers: {
          'X-XSRF-TOKEN': xsrfToken,
        },
      })
      .build()

    connection
      .start()
      .then(() => {
        connection.invoke(method, ...args)
      })
      .catch((err) => {
        return console.error(err.toString())
      })

    return connection
  }

  /**
   * close the signalR connection
   * @param connection signalR connection
   */
  const closeConnection = async (connection: HubConnection) => {
    return connection.stop()
  }

  return {
    createSignalRConnection,
    closeConnection,
  }
}
