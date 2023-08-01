from flask import Flask, request, url_for, session, redirect
import spotipy
from spotipy.oauth2 import SpotifyOAuth
import time
import urllib.request
from PIL import Image
from flask import jsonify

app = Flask(__name__)

app.secret_key = "SECRET_KEY" #generate randomly on the fly; session key
app.config['SESSION_COOKIE_NAME'] = 'Williams Cookie'
TOKEN_INFO = "token_info" #key to get info for this session dictionary

@app.route('/')
def login():
    sp_oauth = create_spotify_oauth()
    auth_url = sp_oauth.get_authorize_url()
    return redirect(auth_url)

@app.route('/redirect')
def redirectPage():
    sp_oauth = create_spotify_oauth()
    session.clear()
    code = request.args.get('code')
    token_info = sp_oauth.get_access_token(code)
    session[TOKEN_INFO] = token_info
    return redirect(url_for('getTracks',_external = True)) #where do we redirect after authorizing

@app.route('/logout')
def logout():
    for key in list (session.keys()):
        session.pop(key)
    return redirect('/')

@app.route('/getTracks')
def getTracks():
    try:
        token_info = get_token()
    except:
        print("user not logged in") #send them to login page again
        return redirect("/")
    sp = spotipy.Spotify(auth=token_info['access_token'])

    all_songs = []
    items = sp.current_user_top_tracks(limit = 10, offset = 0, time_range = 'medium_term')['items']
    for idx, item in enumerate(items):
        name = item['name']
        artistList = item['artists']
        artist = artistList[0]['name']
        val = name + " - " + artist
        all_songs+=[val]
    return all_songs

@app.route('/getTrackImages')
def getTrackImages():
    try:
        token_info = get_token()
    except:
        print("user not logged in") #send them to login page again
        return redirect("/")
    sp = spotipy.Spotify(auth=token_info['access_token'])

    all_songs_images = []
    items = sp.current_user_top_tracks(limit = 10, offset = 0, time_range = 'medium_term')['items']
    for idx, item in enumerate(items):
        album = item['album']
        images = album['images']
        url = images[0]['url']
        all_songs_images+=[url]
    return all_songs_images

@app.route('/getArtists')
def getArtists():
    try:
        token_info = get_token()
    except:
        print("user not logged in") #send them to login page again
        return redirect("/")
    sp = spotipy.Spotify(auth=token_info['access_token'])

    all_artists = []
    items = sp.current_user_top_artists(limit = 10, offset = 0, time_range = 'medium_term')['items']
    for idx, item in enumerate(items):
        name = item['name']
        val = name
        all_artists+=[val]

    return jsonify(all_artists)

@app.route('/getArtistImages')
def getArtistImages():
    try:
        token_info = get_token()
    except:
        print("user not logged in") #send them to login page again
        return redirect("/")
    sp = spotipy.Spotify(auth=token_info['access_token'])

    all_artists_images = [] #urls of all the artists
    items = sp.current_user_top_artists(limit = 1, offset = 0, time_range = 'medium_term')['items']
    for idx, item in enumerate(items):
        images = item['images']
        url = images[0]['url']
        all_artists_images+=[url]

    return all_artists_images

def get_token(): #fresh token info
    token_info = session.get(TOKEN_INFO, None)
    if not token_info:
        raise "exception"
    now = int(time.time())

    is_expired = token_info['expires_at'] - now < 60
    if(is_expired):
        sp_oauth = create_spotify_oauth()
        token_info = sp_oauth.refresh_access_token(token_info['refresh_token'])
    return token_info

client_id = "CLIENT"
client_secret = "CLIENT" ## DONT CHECK THIS INTO GITHUB reset it everytime


def create_spotify_oauth(): #every time u call this, make a new object; dont reuse the same one
    return SpotifyOAuth(
        client_id = "CLIENT",
        client_secret="CLIENT",
        redirect_uri=url_for('redirectPage',_external = True), #where we send the user after oauth
        scope = "user-library-read user-top-read playlist-modify-public"
    )
app.run(host='127.0.0.1', port=5000)
