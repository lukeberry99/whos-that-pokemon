import { withTRPC } from "@trpc/next"
import superjson from "superjson"
import { AppType } from "next/dist/shared/lib/utils"
import { AppRouter } from "./api/trpc/[trpc]"
import "../styles/globals.css"
import "tailwindcss/tailwind.css"
import Head from "next/head"
import PlausibleProvider from "next-plausible"

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <PlausibleProvider domain="pokemon.luke-berry.co.uk">
      <Head>
        <title>Guess the Pokémon</title>
        <meta
          name="description"
          content="Can you guess all 151 original Pokémon"
        />
      </Head>
      <Component {...pageProps} />
    </PlausibleProvider>
  )
}

function getBaseUrl() {
  if (process.browser) return "" // Browser should use the current URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}` // SSR should use vercel URL

  return `http://localhost:${process.env.PORT ?? 3000}` // dev SSR should use localhost
}

export default withTRPC<AppRouter>({
  config({ ctx }) {
    /**
     * If you want to use SSR, you need to use the server's full URL
     * @link https://trpc.io/docs/ssr
     */
    const url = `${getBaseUrl()}/api/trpc`

    return {
      url,
      transformer: superjson,
      /**
       * @link https://react-query.tanstack.com/reference/QueryClient
       */
      // queryClientConfig: { defaultOptions: { queries: { staleTime: 60 } } },
    }
  },
  /**
   * @link https://trpc.io/docs/ssr
   */
  ssr: false,
})(MyApp)
