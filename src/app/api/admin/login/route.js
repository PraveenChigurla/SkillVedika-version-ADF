const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function POST(req) {
	try {
		const body = await req.json();
		const incomingCookie = req.headers.get("cookie") || "";

		// Debug: Log the received body
		if (process.env.NODE_ENV !== 'production') {
			console.log('[proxy admin login POST] Received body:', JSON.stringify(body));
			console.log('[proxy admin login POST] Body has email:', !!body?.email, 'email value:', body?.email);
			console.log('[proxy admin login POST] Body has password:', !!body?.password, 'password length:', body?.password?.length);
		}

		const target = BACKEND_URL.replace('/api', '') + "/api/admin/login";
		console.log('admin login proxy target', target);
		if (process.env.NODE_ENV !== 'production') {
			console.log('[proxy admin login POST] target=', target, 'incomingCookie length=', incomingCookie.length, 'bodyPreview=', JSON.stringify(body).substring(0,200));
		}

		// Validate body before sending
		if (!body || typeof body !== 'object') {
			console.error('[proxy admin login POST] Invalid body received:', body);
			return new Response(JSON.stringify({ message: 'Invalid request body' }), { status: 400 });
		}

		if (!body.email || !body.password) {
			console.error('[proxy admin login POST] Missing email or password:', { hasEmail: !!body.email, hasPassword: !!body.password });
			return new Response(JSON.stringify({ message: 'Email and password are required' }), { status: 400 });
		}

		const requestBody = JSON.stringify(body);
		if (process.env.NODE_ENV !== 'production') {
			console.log('[proxy admin login POST] Sending to backend:', requestBody.substring(0, 100));
		}

		const res = await fetch(target, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
				...(incomingCookie ? { cookie: incomingCookie } : {}),
			},
			credentials: "include", // Important for cookies
			body: requestBody,
		});

		// Forward Set-Cookie header to browser (Laravel sets HTTP-only cookie)
		const setCookie = res.headers.get("set-cookie");
		const text = await res.text();
		
		if (process.env.NODE_ENV !== 'production') {
			console.log('[proxy admin login POST] Backend response status:', res.status);
			console.log('[proxy admin login POST] Set-Cookie header present:', !!setCookie);
			if (setCookie) {
				console.log('[proxy admin login POST] Set-Cookie preview:', setCookie.substring(0, 200));
			}
		}
		
		const responseInit = { 
			status: res.status,
			headers: {
				"Content-Type": "application/json",
			}
		};
		
		// Forward the Set-Cookie header so browser receives the HTTP-only cookie
		// This is critical - the browser must receive this to set the cookie
		if (setCookie) {
			responseInit.headers["set-cookie"] = setCookie;
			if (process.env.NODE_ENV !== 'production') {
				console.log('[proxy admin login POST] Forwarding Set-Cookie to browser');
			}
		} else {
			if (process.env.NODE_ENV !== 'production') {
				console.warn('[proxy admin login POST] WARNING: No Set-Cookie header from backend!');
			}
		}

		try { 
			return new Response(JSON.stringify(JSON.parse(text)), responseInit); 
		} catch { 
			return new Response(text, responseInit); 
		}
	} catch (e) {
		console.error('admin login POST proxy error (target=' + (typeof target !== 'undefined' ? target : BACKEND_URL) + ')', e);
		const errMessage = e && e.message ? e.message : 'Unknown error';
		return new Response(JSON.stringify({ message: 'Failed to contact backend', backend: (typeof target !== 'undefined' ? target : BACKEND_URL), error: errMessage }), { status: 502 });
	}
}

