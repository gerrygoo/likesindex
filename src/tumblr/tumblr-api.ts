const API_KEY = '9MwDZZAj31FhNqKXu2wDVgyToi7AvyfWLZbAyl5B1JBuxUMvjD'
const TUMBLR_URL = 'https://api.tumblr.com/'

interface ApiResponse<T> {
	meta: {
	  status: number
		msg: string
	}
	response: T
}

interface ApiRequest {
	api_key: string
}

interface LikesRequest {
  limit?: number
  offset?: number
  before?: number
  after?: number
}

type ApiParams = ApiRequest & (LikesRequest)

interface Like {}
type LikesResponse = {
  likedPosts: Like[]
  likedCount: number
}


const TumblrQuery = (path: string, params: ApiParams) => {
	const url = new URL(TUMBLR_URL)
	url.pathname = `/v2/${path}`

	for (const [param, val] of Object.entries(params)) {
		url.searchParams.append(param, val)
	}

	console.log(`${url}`)
	return `${url}`
}

const TumblrFetch = async <T>(url: string): Promise<T> => {
		const tumblrRes = await fetch(url)
		const { meta, response } = await tumblrRes.json() as ApiResponse<T>

		// TODO: handle errors graciously?
		if (meta.status !== 200) {
			console.log(`tumblr api returned ${meta.status}: ${meta.msg}`)
			return {} as T
		}
		return response
}

class Blog {
	onBlogPath: (blogAttr: string) => string
	apiKey: string

	constructor(blog: string, apiKey: string) {
		this.onBlogPath = (blogAttr) => `blog/${blog}/${blogAttr}`
		this.apiKey = apiKey 
	}

  // https://www.tumblr.com/docs/en/api/v2#userlikes--retrieve-a-users-likes
  async likes(req: LikesRequest): Promise<LikesResponse> {
		return TumblrFetch<LikesResponse>(
			TumblrQuery(this.onBlogPath('likes'), {api_key: this.apiKey, ...req}))
  }
}

class TumblrApi {
  key: string

  constructor(key: string) {
    this.key = key
  }

	blog(blogName: string) {
		return new Blog(blogName, this.key)
	}
}

export const Tumblr = new TumblrApi(API_KEY)

