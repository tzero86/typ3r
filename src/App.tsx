import React, { useState, useEffect, useRef } from 'react';
    import { Copy, Timer, Users, Award, TrendingUp, Target, Sun, Moon } from 'lucide-react';
    import { v4 as uuidv4 } from 'uuid';

    const quotes = [
      "The quick brown fox jumps over the lazy dog.",
      "The only way to do great work is to love what you do.",
      "Strive not to be a success, but rather to be of value.",
      "The mind is everything. What you think you become.",
      "Life is what happens when you're busy making other plans."
    ];

    interface Player {
      id: string;
      name: string;
      progress: number;
      speed: number;
      accuracy: number;
      avatar: string;
      color: string;
    }

    function App() {
      const [currentQuote, setCurrentQuote] = useState('');
      const [userInput, setUserInput] = useState('');
      const [startTime, setStartTime] = useState<number | null>(null);
      const [endTime, setEndTime] = useState<number | null>(null);
      const [typingSpeed, setTypingSpeed] = useState(0);
      const [players, setPlayers] = useState<Player[]>([]);
      const [isTestRunning, setIsTestRunning] = useState(false);
      const [isSessionStarted, setIsSessionStarted] = useState(false);
      const [countdown, setCountdown] = useState(0);
      const inputRef = useRef<HTMLTextAreaElement>(null);
      const [sessionId, setSessionId] = useState<string | null>(null);
      const [joinSessionId, setJoinSessionId] = useState('');
      const [isDarkMode, setIsDarkMode] = useState(false);

      const isSessionOwner = () => sessionId && players.length > 0 && players[0].id === 'me';

      const playerColors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];

      useEffect(() => {
        const randomIndex = Math.floor(Math.random() * quotes.length);
        setCurrentQuote(quotes[randomIndex]);
        setPlayers([]);
      }, []);

      useEffect(() => {
        if (isTestRunning) {
          const opponentInterval = setInterval(() => {
            setPlayers(prevPlayers =>
              prevPlayers.map(player => {
                if (player.id !== 'me') {
                  return {
                    ...player,
                    progress: Math.min(100, player.progress + Math.random() * 5),
                  };
                }
                return player;
              })
            );
          }, 500);

          return () => clearInterval(opponentInterval);
        }
      }, [isTestRunning]);

      const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newUserInput = e.target.value;
        setUserInput(newUserInput);

        if (!startTime && isSessionStarted) {
          setStartTime(Date.now());
          setIsTestRunning(true);
        }

        let correctChars = 0;
        for (let i = 0; i < newUserInput.length; i++) {
          if (newUserInput[i] === currentQuote[i]) {
            correctChars++;
          }
        }

        setPlayers(prevPlayers =>
          prevPlayers.map(player => {
            if (player.id === 'me') {
              return {
                ...player,
                accuracy: newUserInput.length === 0 ? 100 : (correctChars / newUserInput.length) * 100,
                progress: (newUserInput.length / currentQuote.length) * 100
              };
            }
            return player;
          })
        );

        if (newUserInput === currentQuote) {
          setEndTime(Date.now());
          setIsTestRunning(false);
        }
      };

      useEffect(() => {
        if (startTime && endTime) {
          const timeElapsedInSeconds = (endTime - startTime) / 1000;
          const words = userInput.split(' ').length;
          const wpm = Math.round(words / timeElapsedInSeconds * 60);
          setTypingSpeed(wpm);
          setPlayers(prevPlayers =>
            prevPlayers.map(player => {
              if (player.id === 'me') {
                return { ...player, speed: wpm };
              }
              return player;
            })
          );
        }
      }, [endTime, startTime, userInput]);

      const resetTest = () => {
        const randomIndex = Math.floor(Math.random() * quotes.length);
        setCurrentQuote(quotes[randomIndex]);
        setUserInput('');
        setStartTime(null);
        setEndTime(null);
        setTypingSpeed(0);
        setPlayers(prevPlayers =>
          prevPlayers.map(player => {
            if (player.id === 'me') {
              return { ...player, accuracy: 100, progress: 0 };
            }
            return player;
          })
        );
        setIsTestRunning(false);
        setIsSessionStarted(false);
        setCountdown(0);
        if (inputRef.current) {
          inputRef.current.focus();
        }
      };

      const copyQuote = () => {
        navigator.clipboard.writeText(currentQuote);
      };

      const createSession = () => {
        const newSessionId = uuidv4();
        setSessionId(newSessionId);
        const newPlayers = [
          { id: 'me', name: 'You', progress: 0, speed: 0, accuracy: 100, avatar: '🚗', color: playerColors[0] },
          { id: 'opponent-1', name: 'Opponent 1', progress: 0, speed: 0, accuracy: 100, avatar: '🚗', color: playerColors[1] },
          { id: 'opponent-2', name: 'Opponent 2', progress: 0, speed: 0, accuracy: 100, avatar: '🚗', color: playerColors[2] },
        ];
        setPlayers(newPlayers);
      };

      const startSession = () => {
        if (isSessionOwner()) {
          setIsSessionStarted(true);
          setCountdown(10);
        }
      };

      const handleJoinSession = () => {
        if (joinSessionId) {
          setSessionId(joinSessionId);
          const newPlayers = [
            { id: 'me', name: 'You', progress: 0, speed: 0, accuracy: 100, avatar: '🚗', color: playerColors[0] },
            { id: 'opponent-1', name: 'Opponent 1', progress: 0, speed: 0, accuracy: 100, avatar: '🚗', color: playerColors[1] },
            { id: 'opponent-2', name: 'Opponent 2', progress: 0, speed: 0, accuracy: 100, avatar: '🚗', color: playerColors[2] },
          ];
          setPlayers(newPlayers);
          setIsSessionStarted(true);
          setCountdown(10);
        }
      };

      useEffect(() => {
        if (countdown > 0) {
          const countdownInterval = setInterval(() => {
            setCountdown(prevCountdown => prevCountdown - 1);
          }, 1000);

          return () => clearInterval(countdownInterval);
        } else if (countdown === 0 && !startTime && isSessionStarted) {
          setStartTime(Date.now());
          setIsTestRunning(true);
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }
      }, [countdown, startTime, isSessionStarted]);

      useEffect(() => {
        if (isTestRunning) {
          const allPlayersFinished = players.every(player => player.progress >= 100);
          if (allPlayersFinished) {
            setIsTestRunning(false);
            setEndTime(Date.now());
          }
        }
      }, [players, isTestRunning]);

      const toggleDarkMode = () => {
        setIsDarkMode(prevMode => !prevMode);
      };


      return (
        <div className={`${isDarkMode ? 'dark' : ''} min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 dark:from-gray-900 dark:via-gray-800 dark:to-black flex flex-col items-center justify-center p-4`}>
          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl w-full max-w-6xl">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-4xl font-bold text-gray-800 dark:text-white flex items-center">
                <Award className="mr-2 text-yellow-500 w-8 h-8" /> TYP3r - Typing Speed Challenge
              </h1>
              <button
                onClick={toggleDarkMode}
                className="text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full p-3 focus:outline-none transition-colors duration-200"
                title="Toggle Dark Mode"
              >
                {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
              </button>
            </div>

            {!sessionId ? (
              <div className="flex justify-center">
                <button
                  onClick={createSession}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-full focus:outline-none focus:shadow-outline transition-colors duration-200"
                >
                  <Users className="mr-2 w-6 h-6" /> Create Session
                </button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center">
                    <span className="text-3xl mr-2" style={{ color: players.find(p => p.id === 'me')?.color }}>{players.find(p => p.id === 'me')?.avatar}</span>
                    <span className="text-gray-700 dark:text-gray-300 font-semibold text-lg">You</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="mr-2 text-blue-500 w-6 h-6" />
                    <span className="text-gray-700 dark:text-gray-300 font-semibold text-lg">Opponents</span>
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="session-id" className="block text-gray-700 dark:text-gray-300 text-lg font-bold mb-2">Session ID:</label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      id="session-id"
                      value={sessionId}
                      readOnly
                      className="shadow-md appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 dark:text-gray-300 dark:bg-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-gray-400 transition-shadows duration-200"
                    />
                    <button
                      onClick={() => navigator.clipboard.writeText(sessionId || '')}
                      className="ml-3 bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full focus:outline-none focus:shadow-outline transition-colors duration-200"
                      title="Copy Session ID"
                    >
                      <Copy size={20} />
                    </button>
                  </div>
                </div>

                <div className="mb-8">
                  <label htmlFor="join-session-id" className="block text-gray-700 dark:text-gray-300 text-lg font-bold mb-2">Join Session:</label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      id="join-session-id"
                      value={joinSessionId}
                      onChange={(e) => setJoinSessionId(e.target.value)}
                      placeholder="Enter Session ID"
                      className="shadow-md appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 dark:text-gray-300 dark:bg-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-gray-400 transition-shadows duration-200"
                    />
                    <button
                      onClick={handleJoinSession}
                      className="ml-3 bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-full focus:outline-none focus:shadow-outline transition-colors duration-200"
                    >
                      Join
                    </button>
                  </div>
                </div>

                <div className="relative mb-6">
                  <div className="bg-gray-100 dark:bg-gray-900 rounded-2xl p-6 text-gray-700 dark:text-gray-300 relative border-2 border-purple-300 dark:border-gray-600">
                    <p className="font-mono text-xl whitespace-pre-wrap break-words">
                      {currentQuote.split('').map((char, index) => {
                        const player = players.find(p => p.id === 'me');
                        const userProgress = player ? player.progress : 0;
                        const charIndex = Math.floor(userProgress / 100 * currentQuote.length);

                        let color = 'text-gray-700 dark:text-gray-300';
                        if (userInput.length > index) {
                          color = char === userInput[index] ? 'text-green-500' : 'text-red-500';
                        } else if (index < charIndex){
                          color = 'text-green-500';
                        }
                        return (
                          <span key={index} className={color}>
                            {char}
                          </span>
                        );
                      })}
                    </p>
                    <button
                      onClick={copyQuote}
                      className="absolute top-4 right-4 p-3 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none transition-colors duration-200"
                      title="Copy Quote"
                    >
                      <Copy size={20} />
                    </button>
                  </div>
                </div>

                <textarea
                  ref={inputRef}
                  value={userInput}
                  onChange={handleInputChange}
                  placeholder={isSessionStarted ? (countdown > 0 ? `Starting in ${countdown}...` : "Start typing here...") : "Waiting for session owner to start..."}
                  className="w-full p-6 border-2 border-purple-300 dark:border-gray-600 dark:bg-gray-800 rounded-2xl resize-none font-mono text-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-gray-400 transition-shadows duration-200"
                  rows={4}
                  disabled={!isSessionStarted || countdown > 0 || endTime !== null}
                />

                <div className="mt-8">
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">Race Progress</h3>
                  <div className="race-track">
                    {players.map((player, index) => (
                      <div key={player.id} className="race-lane" style={{ top: `${index * 40}px` }}>
                        <div className="start-line" style={{ backgroundColor: player.color }}></div>
                        <div
                          className="player-car"
                          style={{ left: `${player.progress}%`, backgroundColor: player.color }}
                        >
                          {player.avatar}
                        </div>
                        <div className="finish-line" style={{ backgroundColor: player.color }}></div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <div className="bg-yellow-100 dark:bg-yellow-800 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-600">
                    <p className="text-lg text-yellow-600">Time Elapsed</p>
                    <p className="text-2xl font-semibold">
                      {startTime ? `${Math.floor((Date.now() - startTime) / 1000)}s` : '0s'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="bg-purple-100 dark:bg-purple-800 p-6 rounded-2xl border border-purple-200 dark:border-purple-600">
                    <p className="text-lg text-purple-600 flex items-center">
                      <TrendingUp className="mr-2 w-6 h-6" /> Typing Speed
                    </p>
                    <p className="text-2xl font-semibold">{typingSpeed} WPM</p>
                  </div>
                  <div className="bg-red-100 dark:bg-red-800 p-6 rounded-2xl border border-red-200 dark:border-red-600">
                    <p className="text-lg text-red-600 flex items-center">
                      <Target className="mr-2 w-6 h-6" /> Accuracy
                    </p>
                    <p className="text-2xl font-semibold">{players.find(p => p.id === 'me')?.accuracy.toFixed(2) || 100}%</p>
                  </div>
                </div>

                {isSessionOwner() && !isSessionStarted && (
                  <button
                    onClick={startSession}
                    className="mt-8 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full focus:outline-none focus:shadow-outline transition-colors duration-200"
                  >
                    <Timer className="mr-2 w-6 h-6" />
                    Start Session
                  </button>
                )}

                {countdown > 0 && (
                  <div className="text-center mt-6">
                    <p className="text-5xl font-extrabold text-purple-600 dark:text-gray-300">Starting in {countdown}</p>
                  </div>
                )}

                <h2 className="text-3xl font-bold text-gray-800 dark:text-white mt-10 mb-6">Leaderboard</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
                    <thead className="bg-gray-100 dark:bg-gray-800">
                      <tr>
                        <th scope="col" className="px-6 py-4 text-left text-lg font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          Player
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-lg font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          Speed (WPM)
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-lg font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          Accuracy
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-300 dark:divide-gray-600">
                      {players.map((player) => (
                        <tr key={player.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className='text-xl' style={{color: player.color}}>{player.avatar}</span>
                              <div className="text-lg font-medium text-gray-900 dark:text-gray-300 ml-2">{player.name}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-lg text-gray-600 dark:text-gray-300">{player.speed}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-lg text-gray-600 dark:text-gray-300">{player.accuracy.toFixed(2)}%</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button
                  onClick={resetTest}
                  className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full focus:outline-none focus:shadow-outline transition-colors duration-200"
                >
                  <Timer className="mr-2 w-6 h-6" />
                  Reset Test
                </button>
              </>
            )}
          </div>
        </div>
      );
    }

    export default App;
