# TMDB's official movie genre ids (stable, rarely change)
GENRE_IDS = {
    "action": 28,
    "adventure": 12,
    "animation": 16,
    "comedy": 35,
    "crime": 80,
    "documentary": 99,
    "drama": 18,
    "family": 10751,
    "fantasy": 14,
    "history": 36,
    "horror": 27,
    "music": 10402,
    "mystery": 9648,
    "romance": 10749,
    "science fiction": 878,
    "sci-fi": 878,
    "tv movie": 10770,
    "thriller": 53,
    "war": 10752,
    "western": 37,
}

# Mood -> a small ranked set of genres to blend in /discover/movie's with_genres (OR'd)
MOOD_GENRE_MAP = {
    "happy": [35, 10751, 16, 12],          # comedy, family, animation, adventure
    "sad": [18, 10749],                     # drama, romance
    "excited": [28, 12, 878, 53],           # action, adventure, sci-fi, thriller
    "relaxed": [10751, 16, 99, 10402],       # family, animation, documentary, music
    "scared": [27, 53, 9648],                # horror, thriller, mystery
    "romantic": [10749, 35],                 # romance, comedy
    "nostalgic": [12, 10751, 16],            # adventure, family, animation
    "thoughtful": [18, 99, 9648],            # drama, documentary, mystery
}
