Testing Instructions
1. Google Cloud Setup
Go to Google Cloud Console
Create or select a project
Go to APIs & Services → Credentials
Create OAuth 2.0 Client ID (Web application)
Add authorized redirect URI: http://localhost:3000/api/auth/google/callback
Copy Client ID and Secret to 
.env
2. Test Scenarios
Scenario	Expected Result
Disabled (GOOGLE_OAUTH_ENABLED=false)	No Google button shown
New user signup via Google	User created, trial applied, logged in
Existing user login via Google	Logged in (provider linked automatically)
Signup disabled + new Google user	Redirect to login with error
Referral + Google signup	Referral attribution preserved
3. Admin Verification
Login as superadmin
Navigate to Admin → Users
Verify "Auth" column shows providers (🔑 password, 🔵 google)
Test filter by "All Auth Methods" dropdown