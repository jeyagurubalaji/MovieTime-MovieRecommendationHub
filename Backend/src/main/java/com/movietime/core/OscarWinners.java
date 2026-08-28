package com.movietime.core;

import java.util.List;
import java.util.Map;

/**
 * Best Picture Academy Award winners, title + year, used to look each one up on TMDB by
 * search rather than hardcoding TMDB ids (which can't be verified from this environment).
 */
public final class OscarWinners {

    public static final List<Map.Entry<String, Integer>> BEST_PICTURE_WINNERS = List.of(
            Map.entry("Oppenheimer", 2023),
            Map.entry("Everything Everywhere All at Once", 2022),
            Map.entry("CODA", 2021),
            Map.entry("Nomadland", 2020),
            Map.entry("Parasite", 2019),
            Map.entry("Green Book", 2018),
            Map.entry("The Shape of Water", 2017),
            Map.entry("Moonlight", 2016),
            Map.entry("Spotlight", 2015),
            Map.entry("Birdman", 2014),
            Map.entry("12 Years a Slave", 2013),
            Map.entry("Argo", 2012),
            Map.entry("The Artist", 2011),
            Map.entry("The King's Speech", 2010),
            Map.entry("The Hurt Locker", 2009),
            Map.entry("Slumdog Millionaire", 2008),
            Map.entry("No Country for Old Men", 2007),
            Map.entry("The Departed", 2006),
            Map.entry("Crash", 2005),
            Map.entry("Million Dollar Baby", 2004),
            Map.entry("The Lord of the Rings: The Return of the King", 2003),
            Map.entry("Chicago", 2002),
            Map.entry("A Beautiful Mind", 2001),
            Map.entry("Gladiator", 2000),
            Map.entry("American Beauty", 1999),
            Map.entry("Titanic", 1997),
            Map.entry("Braveheart", 1995),
            Map.entry("Forrest Gump", 1994),
            Map.entry("Schindler's List", 1993),
            Map.entry("Unforgiven", 1992)
    );

    private OscarWinners() {}
}
