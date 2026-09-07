-- Traductions EN du contenu éditorial Seranya (Post / Tutorial / Definition).
-- Généré le 2026-09-07. Ne modifie que les colonnes *En, jamais le FR.
-- À exécuter sur la MÊME base que `prisma migrate deploy` :
--   psql "$DATABASE_URL" -f scripts/seed-en-translations.sql
-- Rejouable sans risque (écrase les *En existants avec les mêmes valeurs).

BEGIN;

-- ============================ POSTS ============================

UPDATE "Post" SET
  "titleEn"    = $en$The fundamentals of yoga: a thousand-year-old philosophy$en$,
  "introEn"    = $en$Before it is a physical practice, yoga is an Indian philosophy more than 2,500 years old. Discover its origins and what it really means.$en$,
  "subtitleEn" = $en$Understanding where yoga comes from to practise it better$en$,
  "contentEn"  = $en$
<p>The word "yoga" comes from the Sanskrit <em>yuj</em>, meaning "to link" or "to unite". It refers to the union of body, breath and mind, but also that of the individual with something greater than themselves.</p>
<h2>An origin far older than the yoga mat</h2>
<p>The earliest traces of yoga go back to the Indus Valley civilisation, more than 4,000 years ago. But it was with the <strong>Yoga Sutras of Patanjali</strong>, written around 2,000 years ago, that yoga was formalised as a structured path towards mental clarity and inner peace.</p>
<h2>Much more than postures</h2>
<p>What we call "doing yoga" today — moving through postures (asanas) — is only one branch out of eight. Originally, yoga also encompasses ethics, breathing, concentration and meditation.</p>
<p>Understanding this origin makes it possible to approach the practice differently: not as mere gymnastics, but as a path of gradual transformation, accessible at your own pace.</p>
$en$
WHERE id = 4;

UPDATE "Post" SET
  "titleEn"    = $en$The power of the breath: understanding pranayama$en$,
  "introEn"    = $en$Breathing is automatic, but breathing consciously can change our inner state within minutes. Here are the basics of pranayama, the art of the breath.$en$,
  "subtitleEn" = $en$The scientific basis of conscious breathing$en$,
  "contentEn"  = $en$
<p>The word <strong>pranayama</strong> (from the Sanskrit <em>prana</em>, vital energy, and <em>ayama</em>, extension) refers to the set of breathing techniques used in yoga. Far from being a mere spiritual curiosity, its effects can now be measured.</p>
<h2>What happens in the body</h2>
<p>Slow, deep breathing stimulates the vagus nerve, which activates the parasympathetic nervous system — the one that lowers heart rate, blood pressure and cortisol levels (the stress hormone).</p>
<h2>A simple technique to try</h2>
<ul>
<li>Breathe in through the nose for 4 seconds</li>
<li>Hold the breath for 4 seconds</li>
<li>Breathe out slowly through the nose for 6 seconds</li>
<li>Repeat for 3 to 5 minutes</li>
</ul>
<p>This lengthened out-breath sends the brain a signal of safety: there is no danger, the body can relax. It is one of the simplest and most powerful tools in yoga.</p>
$en$
WHERE id = 5;

UPDATE "Post" SET
  "titleEn"    = $en$Yoga and the nervous system: the science of relaxation$en$,
  "introEn"    = $en$Why do we feel so calm after a yoga session? The answer lies in our autonomic nervous system.$en$,
  "subtitleEn" = $en$What the practice really does to your body$en$,
  "contentEn"  = $en$
<p>Our autonomic nervous system works like a set of scales: on one side the sympathetic system (alertness, action, stress), on the other the parasympathetic system (rest, digestion, recovery).</p>
<h2>A way of life tipped the wrong way</h2>
<p>The pace of modern life — notifications, deadlines, over-stimulation — keeps many of us in a state of near-constant alert. The body stays tense even when there is no real danger.</p>
<h2>How yoga restores the balance</h2>
<p>The combination of slow movement, deep breathing and attention to bodily sensations acts directly on the parasympathetic system. Neuroscience studies have shown a measurable drop in cortisol and an increase in heart-rate variability after regular practice.</p>
<p>So it is not just an impression of relaxation: it is a real physiological change, within reach in a few sessions a week.</p>
$en$
WHERE id = 6;

UPDATE "Post" SET
  "titleEn"    = $en$The sun salutation: the anatomy of a practice$en$,
  "introEn"    = $en$The most iconic sequence in yoga, the sun salutation engages the whole body. A breakdown, posture by posture.$en$,
  "subtitleEn" = $en$Understanding each movement to feel it more fully$en$,
  "contentEn"  = $en$
<p>The <strong>sun salutation</strong> (Surya Namaskar) is a flowing sequence of postures, traditionally practised in the morning to wake the body gently.</p>
<h2>One sequence, several benefits</h2>
<ul>
<li><strong>Stretching the back line of the body</strong> in the forward fold, which loosens the hamstrings and lower back</li>
<li><strong>Strengthening the arms and shoulders</strong> during the plank and downward-facing dog</li>
<li><strong>Opening the chest</strong> in the cobra, which counterbalances hours spent hunched over a screen</li>
<li><strong>Mobilising the spine</strong> at every transition between flexion and extension</li>
</ul>
<h2>The role of the breath</h2>
<p>Each movement is paired with a specific in-breath or out-breath. This synchronisation turns a simple physical sequence into a moving meditation: attention stays anchored in the breath rather than in thoughts.</p>
$en$
WHERE id = 7;

UPDATE "Post" SET
  "titleEn"    = $en$Starting yoga: key postures and mistakes to avoid$en$,
  "introEn"    = $en$Getting started with yoga can feel intimidating. Here are the essential postures for a calm beginning, and the most common beginner mistakes.$en$,
  "subtitleEn" = $en$A simple guide to taking your first steps on the mat$en$,
  "contentEn"  = $en$
<p>You do not need to be flexible to start yoga — quite the opposite: flexibility is a result of the practice, not a condition for beginning it.</p>
<h2>Four postures to lay the foundations</h2>
<ul>
<li><strong>Child's pose</strong>: a way back to calm, available at any moment</li>
<li><strong>Mountain pose</strong>: to learn to feel a stable postural alignment</li>
<li><strong>Cat-cow</strong>: to mobilise the spine gently</li>
<li><strong>Warrior I</strong>: to build strength and grounding in the legs</li>
</ul>
<h2>The most common mistakes</h2>
<p>The first is to compare your practice with that of others, or with images seen online. Yoga is not a flexibility contest. The second is to hold your breath while trying to "nail" a posture: the breath should always stay flowing, even if that means reducing the range of the movement.</p>
<p>Finally, a short, regular practice — even 10 minutes, three times a week — is better than one long, isolated session followed by several weeks away from the mat.</p>
$en$
WHERE id = 8;

UPDATE "Post" SET
  "titleEn"    = $en$The 8 limbs of yoga according to Patanjali$en$,
  "introEn"    = $en$The postures are only one step out of eight. Discover Ashtanga Yoga, the complete path described by Patanjali two millennia ago.$en$,
  "subtitleEn" = $en$Ashtanga Yoga, or the eight limbs of the path$en$,
  "contentEn"  = $en$
<p>In the <em>Yoga Sutras</em>, the sage Patanjali describes an eight-step path called <strong>Ashtanga Yoga</strong> (not to be confused with the dynamic style of yoga of the same name). Each limb prepares the next.</p>
<h2>The eight limbs</h2>
<ul>
<li><strong>Yama</strong> — ethics towards others (non-violence, honesty...)</li>
<li><strong>Niyama</strong> — ethics towards oneself (discipline, contentment...)</li>
<li><strong>Asana</strong> — the physical postures</li>
<li><strong>Pranayama</strong> — mastery of the breath</li>
<li><strong>Pratyahara</strong> — withdrawal of the senses from the outer world</li>
<li><strong>Dharana</strong> — concentration on a single point</li>
<li><strong>Dhyana</strong> — continuous meditation</li>
<li><strong>Samadhi</strong> — the state of union and deep peace</li>
</ul>
<p>What we practise on the mat (asana) is therefore only the third step of a much wider path. It prepares the body to stay still and comfortable — a necessary condition for then working with the breath, and then the mind.</p>
$en$
WHERE id = 9;

UPDATE "Post" SET
  "titleEn"    = $en$Meditation and yoga: two paths, one destination$en$,
  "introEn"    = $en$Yoga and meditation are often confused. Yet they are two distinct practices, deeply complementary.$en$,
  "subtitleEn" = $en$Understanding what sets them apart and what connects them$en$,
  "contentEn"  = $en$
<p>Postural yoga works mainly with the body in order to calm the mind; meditation works directly with the mind, often in stillness. Yet both aim at the same state: a clear, stable presence, free of mental agitation.</p>
<h2>Why practise them together</h2>
<p>Sitting in silence for twenty minutes is difficult when the body is tense or restless. By releasing physical tension, yoga postures make meditative stillness far more accessible — which is, in fact, what they were originally designed for.</p>
<h2>A simple practice to begin with</h2>
<p>After a short session of postures, sit comfortably, close your eyes and bring your attention to your breath for five minutes, without trying to control it. Simply notice the air coming in and going out.</p>
<p>This brief moment is often enough to feel the difference between "doing yoga" and "practising yoga" in its fullest sense.</p>
$en$
WHERE id = 10;

UPDATE "Post" SET
  "titleEn"    = $en$The chakras: understanding the energy centres$en$,
  "introEn"    = $en$Root, heart, throat... The chakras are often mentioned in yoga without really being explained. Here is a clear introduction to this symbolic system.$en$,
  "subtitleEn" = $en$A symbolic map of the body and its energies$en$,
  "contentEn"  = $en$
<p>The word <em>chakra</em> means "wheel" in Sanskrit. In the yogic tradition it refers to energy centres spread along the spine, each associated with specific qualities.</p>
<h2>The seven main centres</h2>
<ul>
<li><strong>Muladhara</strong> (root) — grounding and safety</li>
<li><strong>Svadhisthana</strong> (sacral) — creativity and the emotions</li>
<li><strong>Manipura</strong> (solar plexus) — confidence and will</li>
<li><strong>Anahata</strong> (heart) — love and compassion</li>
<li><strong>Vishuddha</strong> (throat) — expression and truth</li>
<li><strong>Ajna</strong> (third eye) — intuition and clarity</li>
<li><strong>Sahasrara</strong> (crown) — connection to something vaster than oneself</li>
</ul>
<h2>How to approach this system today</h2>
<p>You do not need to hold it as a belief to draw something concrete from it: the chakras offer a simple symbolic map for noticing where our tensions or emotional blocks sit, and for guiding the practice accordingly — deep breathing for the throat, chest-opening for the heart, balancing postures for the root.</p>
$en$
WHERE id = 11;

UPDATE "Post" SET
  "titleEn"    = $en$Morning or evening: when to practise yoga according to your body$en$,
  "introEn"    = $en$The best time to practise is not the same for everyone. Here is what chronobiology says about morning and evening yoga.$en$,
  "subtitleEn" = $en$Adapting your practice to the body's natural rhythm$en$,
  "contentEn"  = $en$
<p>Our body follows a circadian rhythm that makes temperature, muscle flexibility and cortisol levels vary throughout the day. This rhythm directly influences how a yoga session will feel.</p>
<h2>Morning yoga</h2>
<p>On waking, the body is naturally stiffer: the muscles and fascia need warmth to regain their mobility. A morning practice, such as the sun salutation, benefits from being slower and more gradual, with gentle postures before moving towards more intensity.</p>
<h2>Evening yoga</h2>
<p>At the end of the day, the body is warmer and more supple, which allows deeper postures. It is also the time when the nervous system most needs to be soothed after the demands of the day: gentle postures, twists and slow breathing are especially at home here, preparing the ground for good-quality sleep.</p>
<p>There is therefore no universally better time: what matters most is regularity, at the hour that fits lastingly into your schedule.</p>
$en$
WHERE id = 12;

UPDATE "Post" SET
  "titleEn"    = $en$Ahimsa and the yamas: the ethics of yoga in everyday life$en$,
  "introEn"    = $en$Before the postures, yoga begins with an ethic. A closer look at the yamas, and in particular at ahimsa, non-violence, the first pillar of the practice.$en$,
  "subtitleEn" = $en$A philosophy of life before it is a practice of the body$en$,
  "contentEn"  = $en$
<p>The <strong>yamas</strong> are the very first branch of the path described by Patanjali: five ethical principles that govern our relationship with others, even before we come to the postures.</p>
<h2>The five yamas</h2>
<ul>
<li><strong>Ahimsa</strong> — non-violence, towards others and towards oneself</li>
<li><strong>Satya</strong> — truth and honesty</li>
<li><strong>Asteya</strong> — non-stealing, including of other people's time or energy</li>
<li><strong>Brahmacharya</strong> — right measure in the use of one's energy</li>
<li><strong>Aparigraha</strong> — non-attachment, letting go of the superfluous</li>
</ul>
<h2>Ahimsa on the mat</h2>
<p>Ahimsa is often seen as the foundation of all the other principles. On the mat it translates very concretely: not forcing a posture to the point of pain, respecting the limits of the day rather than those of yesterday, and letting go of the idea that the practice must be "done right".</p>
<p>This kindness towards oneself, once absorbed on the mat, tends to extend naturally into relationships with others — which is why yoga, far beyond the body, is considered above all an ethical and inner path.</p>
$en$
WHERE id = 13;

-- ========================== TUTORIALS ==========================

UPDATE "Tutorial" SET
  "titleEn"       = $en$Introduction to mindfulness meditation$en$,
  "descriptionEn" = $en$The basics of mindfulness meditation for beginners: posture, breathing, working with thoughts. A 10-minute practice guided step by step to establish a daily routine.$en$
WHERE id = 2;

UPDATE "Tutorial" SET
  "titleEn"       = $en$Pranayama: alternate nostril breathing (Nadi Shodhana)$en$,
  "descriptionEn" = $en$Learn alternate nostril breathing, a fundamental pranayama technique that balances the lunar and solar energies, calms the nervous system and prepares you for meditation.$en$
WHERE id = 3;

UPDATE "Tutorial" SET
  "titleEn"       = $en$The 7 chakras: understanding and balancing your energy centres$en$,
  "descriptionEn" = $en$An overview of the seven main chakras, their locations, their qualities and how to work with them through posture, breathing, mantras and visualisation.$en$
WHERE id = 4;

UPDATE "Tutorial" SET
  "titleEn"       = $en$Metta meditation: cultivating loving-kindness$en$,
  "descriptionEn" = $en$A guided practice of loving-kindness meditation (metta bhavana). Learn to direct wishes of happiness towards yourself, your loved ones, strangers and difficult people.$en$
WHERE id = 5;

UPDATE "Tutorial" SET
  "titleEn"       = $en$Yoga Nidra: deep yogic relaxation$en$,
  "descriptionEn" = $en$A complete 30-minute yoga nidra session. Rotation of awareness through the body, visualisation and access to the hypnagogic state between waking and sleep for deep regeneration.$en$
WHERE id = 6;

UPDATE "Tutorial" SET
  "titleEn"       = $en$Introduction to Buddhism: the Four Noble Truths$en$,
  "descriptionEn" = $en$A clear and accessible explanation of the Four Noble Truths taught by the Buddha: suffering, its origin, its cessation and the path that leads to it. The foundation of all Buddhist philosophy.$en$
WHERE id = 7;

UPDATE "Tutorial" SET
  "titleEn"       = $en$The Noble Eightfold Path: the way to awakening$en$,
  "descriptionEn" = $en$A detailed presentation of the eight branches of the Buddhist path: right view, right intention, right speech, right action, right livelihood, right effort, right mindfulness and right concentration.$en$
WHERE id = 8;

UPDATE "Tutorial" SET
  "titleEn"       = $en$Vipassana meditation: observing without reacting$en$,
  "descriptionEn" = $en$An introduction to insight meditation. A technique for observing bodily sensations, thoughts and emotions with equanimity, developing direct wisdom about the nature of experience.$en$
WHERE id = 9;

UPDATE "Tutorial" SET
  "titleEn"       = $en$Understanding karma: cause, effect and transformation$en$,
  "descriptionEn" = $en$An in-depth exploration of the concept of karma — what it really is (and what it is not), how it works, and how mindful practice can transform our conditioning.$en$
WHERE id = 10;

UPDATE "Tutorial" SET
  "titleEn"       = $en$Sun salutation: a complete Surya Namaskar tutorial$en$,
  "descriptionEn" = $en$Learn the sun salutation step by step, with precise alignment, the breath paired with each movement and variations for beginners. A fundamental 12-posture sequence in yoga.$en$
WHERE id = 11;

UPDATE "Tutorial" SET
  "titleEn"       = $en$Tonglen meditation: transforming suffering through compassion$en$,
  "descriptionEn" = $en$A practical guide to Tibetan Tonglen — taking in suffering and giving out happiness. A powerful practice for developing compassion and moving beyond the fear of suffering.$en$
WHERE id = 12;

UPDATE "Tutorial" SET
  "titleEn"       = $en$Understanding emptiness (Shunyata): an introduction to the Mahayana$en$,
  "descriptionEn" = $en$An exploration of the central concept of Mahayana Buddhism: emptiness of intrinsic existence. How to understand that phenomena exist only in interdependence, and what that means for our daily life.$en$
WHERE id = 13;

UPDATE "Tutorial" SET
  "titleEn"       = $en$Meditation on impermanence: letting go with wisdom$en$,
  "descriptionEn" = $en$A meditative practice and philosophical reflection on impermanence (anicca). Contemplating constant change to cultivate non-attachment and a more vivid presence in each moment.$en$
WHERE id = 14;

UPDATE "Tutorial" SET
  "titleEn"       = $en$Mantras: sacred sounds and inner vibration$en$,
  "descriptionEn" = $en$An introduction to mantras in the yogic and Buddhist traditions. What a mantra is, how to practise it, the fundamental mantras (OM, So Hum, Om Mani Padme Hum) and their deeper meaning.$en$
WHERE id = 15;

UPDATE "Tutorial" SET
  "titleEn"       = $en$Advaita Vedanta: non-duality and the nature of the Self$en$,
  "descriptionEn" = $en$An introduction to Shankara's philosophy and to non-duality. What are Atman, Brahman and Maya? How can this understanding transform our everyday experience?$en$
WHERE id = 16;

-- ========================= DEFINITIONS =========================

UPDATE "Definition" SET "termEn" = $en$Pranayama$en$, "definitionEn" = $en$Super cool$en$, "categoryEn" = $en$Buddhism$en$ WHERE id = 1;

UPDATE "Definition" SET
  "termEn"       = $en$Ahimsa$en$,
  "definitionEn" = $en$The principle of non-violence towards all living beings, regarded as the foundation of spiritual practice in yoga and Buddhism. It applies in thought, speech and action.$en$,
  "categoryEn"   = $en$Yoga$en$
WHERE id = 2;

UPDATE "Definition" SET
  "termEn"       = $en$Pranayama$en$,
  "definitionEn" = $en$The set of techniques for controlling and extending the breath (prana = vital energy, yama = control). Pranayama helps to regulate the energy of the subtle body and to calm the mind.$en$,
  "categoryEn"   = $en$Yoga$en$
WHERE id = 3;

UPDATE "Definition" SET
  "termEn"       = $en$Asana$en$,
  "definitionEn" = $en$A physical posture practised in yoga. Literally "seat" or "comfortable position", asanas aim to prepare the body and mind for meditation by developing strength, flexibility and balance.$en$,
  "categoryEn"   = $en$Yoga$en$
WHERE id = 4;

UPDATE "Definition" SET
  "termEn"       = $en$Dharana$en$,
  "definitionEn" = $en$The sixth limb of yoga according to Patanjali: concentration. It consists of fixing the attention on a single point — an object, an image, a flame or a sensation — without letting it wander.$en$,
  "categoryEn"   = $en$Yoga$en$
WHERE id = 5;

UPDATE "Definition" SET
  "termEn"       = $en$Dhyana$en$,
  "definitionEn" = $en$The seventh limb of yoga according to Patanjali: deep meditation. A state in which attention flows uninterrupted towards the object of concentration, dissolving the boundary between the meditator and the object.$en$,
  "categoryEn"   = $en$Yoga$en$
WHERE id = 6;

UPDATE "Definition" SET
  "termEn"       = $en$Samadhi$en$,
  "definitionEn" = $en$The eighth and final limb of yoga according to Patanjali. A state of total absorption in which the meditator, the act of meditating and the object of meditation become one. Regarded as awakening or liberation.$en$,
  "categoryEn"   = $en$Yoga$en$
WHERE id = 7;

UPDATE "Definition" SET
  "termEn"       = $en$Kundalini$en$,
  "definitionEn" = $en$A dormant spiritual energy represented as a serpent coiled at the base of the spine. Its awakening through yogic practice causes it to rise along the chakras to the crown of the head, bringing about an expansion of consciousness.$en$,
  "categoryEn"   = $en$Yoga$en$
WHERE id = 8;

UPDATE "Definition" SET
  "termEn"       = $en$Chakra$en$,
  "definitionEn" = $en$An energy centre of the subtle body according to the tantric and yogic traditions. There are seven main ones, aligned along the spine, each associated with specific psychological and spiritual qualities.$en$,
  "categoryEn"   = $en$Yoga$en$
WHERE id = 9;

UPDATE "Definition" SET
  "termEn"       = $en$Nadi$en$,
  "definitionEn" = $en$A subtle channel through which the vital energy (prana) circulates in the body. The classical texts describe 72,000 of them, including three main ones: Ida (lunar), Pingala (solar) and Sushumna (central).$en$,
  "categoryEn"   = $en$Yoga$en$
WHERE id = 10;

UPDATE "Definition" SET
  "termEn"       = $en$Bandha$en$,
  "definitionEn" = $en$An energetic lock or contraction practised in yoga to direct and intensify the flow of prana. The three main ones are Mula Bandha (perineum), Uddiyana Bandha (abdomen) and Jalandhara Bandha (throat).$en$,
  "categoryEn"   = $en$Yoga$en$
WHERE id = 11;

UPDATE "Definition" SET
  "termEn"       = $en$Mudra$en$,
  "definitionEn" = $en$A symbolic gesture or energetic seal, often made with the hands. Mudras influence the inner energy and encourage particular states of consciousness during meditation.$en$,
  "categoryEn"   = $en$Yoga$en$
WHERE id = 12;

UPDATE "Definition" SET
  "termEn"       = $en$Svadhyaya$en$,
  "definitionEn" = $en$The study of oneself and of sacred texts. The fourth of the niyamas (inner observances) in Patanjali's yoga. A practice of observing one's own thoughts, emotions and behaviour without judgement.$en$,
  "categoryEn"   = $en$Yoga$en$
WHERE id = 13;

UPDATE "Definition" SET
  "termEn"       = $en$Tapas$en$,
  "definitionEn" = $en$Discipline, ardour and austerity. The third of the niyamas, tapas refers to sustained effort and the inner heat generated by practice. It purifies the mind and strengthens spiritual will.$en$,
  "categoryEn"   = $en$Yoga$en$
WHERE id = 14;

UPDATE "Definition" SET
  "termEn"       = $en$Satya$en$,
  "definitionEn" = $en$Truth and authenticity. The second of the yamas (outer disciplines) in yoga. Satya means aligning one's thoughts, words and actions with the truth, while respecting ahimsa.$en$,
  "categoryEn"   = $en$Yoga$en$
WHERE id = 15;

UPDATE "Definition" SET
  "termEn"       = $en$Ishvara Pranidhana$en$,
  "definitionEn" = $en$Surrender to the divine or to a higher power. The fifth and last of Patanjali's niyamas. It consists of dedicating the fruit of one's actions to something greater than oneself, thereby cultivating humility and devotion.$en$,
  "categoryEn"   = $en$Yoga$en$
WHERE id = 16;

UPDATE "Definition" SET
  "termEn"       = $en$Nirvana$en$,
  "definitionEn" = $en$The state of ultimate liberation in Buddhism, marked by the extinction of desire, hatred and illusion. Literally "extinction" or "blown-out flame", nirvana is the cessation of suffering and of the cycle of rebirths (samsara).$en$,
  "categoryEn"   = $en$Buddhism$en$
WHERE id = 17;

UPDATE "Definition" SET
  "termEn"       = $en$Samsara$en$,
  "definitionEn" = $en$The cycle of existences and rebirths in which all sentient beings are caught, according to Buddhism. This cycle is fuelled by karma and by fundamental ignorance (avidya). Liberation from samsara is the goal of the Buddhist path.$en$,
  "categoryEn"   = $en$Buddhism$en$
WHERE id = 18;

UPDATE "Definition" SET
  "termEn"       = $en$Dharma$en$,
  "definitionEn" = $en$A concept with many meanings: cosmic and universal law, the teachings of the Buddha, the phenomena that make up experience, or individual duty. In the Buddhist context it refers mainly to the Buddha's doctrine and the path to awakening.$en$,
  "categoryEn"   = $en$Buddhism$en$
WHERE id = 19;

UPDATE "Definition" SET
  "termEn"       = $en$Sangha$en$,
  "definitionEn" = $en$The community of Buddhist practitioners. Together with the Buddha and the Dharma, the Sangha is one of the Three Jewels of Buddhism. It can refer both to the monastic community and to lay practitioners as a whole.$en$,
  "categoryEn"   = $en$Buddhism$en$
WHERE id = 20;

UPDATE "Definition" SET
  "termEn"       = $en$Karma$en$,
  "definitionEn" = $en$The law of cause and effect governing actions and their consequences across successive lives. In Buddhism, karma is not a punishment but a natural mechanism: every intention and action leaves imprints that condition future experiences.$en$,
  "categoryEn"   = $en$Buddhism$en$
WHERE id = 21;

UPDATE "Definition" SET
  "termEn"       = $en$Bodhicitta$en$,
  "definitionEn" = $en$The mind of awakening, or the aspiration to attain Buddhahood for the benefit of all sentient beings. A central concept of Mahayana Buddhism, bodhicitta is both an aspiration (relative) and a recognition of the fundamental nature of mind (ultimate).$en$,
  "categoryEn"   = $en$Buddhism$en$
WHERE id = 22;

UPDATE "Definition" SET
  "termEn"       = $en$Bodhisattva$en$,
  "definitionEn" = $en$A being who aspires to awakening for the benefit of all beings and who has vowed not to enter nirvana until all sentient beings are liberated. The central ideal of Mahayana Buddhism.$en$,
  "categoryEn"   = $en$Buddhism$en$
WHERE id = 23;

UPDATE "Definition" SET
  "termEn"       = $en$Anicca$en$,
  "definitionEn" = $en$Impermanence, one of the three marks of existence in Buddhism. Every compounded phenomenon is in perpetual change — no sensation, thought or situation lasts. Contemplating impermanence helps to release attachment.$en$,
  "categoryEn"   = $en$Buddhism$en$
WHERE id = 24;

UPDATE "Definition" SET
  "termEn"       = $en$Dukkha$en$,
  "definitionEn" = $en$Suffering or unsatisfactoriness, the first of the Four Noble Truths. The term refers not only to obvious pain, but also to the subtle dissatisfaction inherent in all conditioned experience, as well as the suffering born of impermanence.$en$,
  "categoryEn"   = $en$Buddhism$en$
WHERE id = 25;

UPDATE "Definition" SET
  "termEn"       = $en$Anatta$en$,
  "definitionEn" = $en$Non-self, the third mark of existence. Buddhism teaches that there is no fixed, permanent, independent "self". What we call "I" is a changing combination of five aggregates (skandhas) with no permanent substrate.$en$,
  "categoryEn"   = $en$Buddhism$en$
WHERE id = 26;

UPDATE "Definition" SET
  "termEn"       = $en$Metta$en$,
  "definitionEn" = $en$Loving-kindness, the first of the four sublime states (brahmaviharas). A practice of cultivating a sincere wish for happiness — for oneself, for loved ones, for strangers, then for difficult beings, and finally for all beings without exception.$en$,
  "categoryEn"   = $en$Buddhism$en$
WHERE id = 27;

UPDATE "Definition" SET
  "termEn"       = $en$Karuna$en$,
  "definitionEn" = $en$Compassion, the second of the brahmaviharas. The deep wish to see all beings freed from suffering. Karuna differs from pity in its absence of condescension — it recognises the fundamental equality of all beings in the face of suffering.$en$,
  "categoryEn"   = $en$Buddhism$en$
WHERE id = 28;

UPDATE "Definition" SET
  "termEn"       = $en$Mudita$en$,
  "definitionEn" = $en$Altruistic or sympathetic joy, the third of the brahmaviharas. The capacity to rejoice sincerely in the happiness and success of others — a direct antidote to jealousy and envy.$en$,
  "categoryEn"   = $en$Buddhism$en$
WHERE id = 29;

UPDATE "Definition" SET
  "termEn"       = $en$Upekkha$en$,
  "definitionEn" = $en$Equanimity, the fourth of the brahmaviharas. A state of stable, impartial calm in the face of all experiences, without attachment or aversion. Upekkha is not indifference but a balanced presence, open to what is.$en$,
  "categoryEn"   = $en$Buddhism$en$
WHERE id = 30;

UPDATE "Definition" SET
  "termEn"       = $en$Prajna$en$,
  "definitionEn" = $en$Wisdom or discernment, one of the six perfections (paramitas) of the bodhisattva. Prajna is the direct, non-conceptual understanding of the nature of reality — in particular the emptiness (shunyata) of all phenomena.$en$,
  "categoryEn"   = $en$Buddhism$en$
WHERE id = 31;

UPDATE "Definition" SET
  "termEn"       = $en$Shunyata$en$,
  "definitionEn" = $en$Emptiness or voidness, a fundamental concept of Mahayana Buddhism. All phenomena are "empty" of intrinsic, independent existence — they exist only in interdependence. Realising emptiness is the heart of Buddhist wisdom.$en$,
  "categoryEn"   = $en$Buddhism$en$
WHERE id = 32;

UPDATE "Definition" SET
  "termEn"       = $en$Vipassana$en$,
  "definitionEn" = $en$Insight meditation, or clear seeing, one of the two main forms of Buddhist meditation. It consists of observing direct experience — sensations, thoughts, emotions — with precision and without reactivity, revealing the three marks of existence.$en$,
  "categoryEn"   = $en$Meditation$en$
WHERE id = 33;

UPDATE "Definition" SET
  "termEn"       = $en$Samatha$en$,
  "definitionEn" = $en$Calm-abiding or concentration meditation, which develops mental tranquillity (shamatha). The practice consists of stabilising attention on a single object — often the breath — until reaching states of deep absorption (jhanas).$en$,
  "categoryEn"   = $en$Meditation$en$
WHERE id = 34;

UPDATE "Definition" SET
  "termEn"       = $en$Zazen$en$,
  "definitionEn" = $en$The seated meditation at the heart of the Zen Buddhist tradition. One sits in a stable posture, facing a wall, letting thoughts pass without holding on to them — neither chasing them nor pushing them away. In Soto Zen, zazen is regarded as awakening itself.$en$,
  "categoryEn"   = $en$Meditation$en$
WHERE id = 35;

UPDATE "Definition" SET
  "termEn"       = $en$Mindfulness$en$,
  "definitionEn" = $en$The English rendering of sati (Pali). Intentional attention, directed towards the present moment, without judgement. Mindfulness observes what is happening — within and around oneself — with curiosity and kindness, free of automatic reactivity.$en$,
  "categoryEn"   = $en$Meditation$en$
WHERE id = 36;

UPDATE "Definition" SET
  "termEn"       = $en$Koan$en$,
  "definitionEn" = $en$A paradox or question that cannot be solved by ordinary logic, used in the Rinzai Zen tradition as an object of meditation. Koans are meant to exhaust the conceptual mind and provoke a direct shift in consciousness — such as "What was your face before your parents were born?"$en$,
  "categoryEn"   = $en$Meditation$en$
WHERE id = 37;

UPDATE "Definition" SET
  "termEn"       = $en$Tonglen$en$,
  "definitionEn" = $en$A Tibetan meditation practice of "giving and taking". On the in-breath, one symbolically takes in the suffering of others; on the out-breath, one sends out happiness and light. Tonglen reverses the natural reflex of avoiding suffering and cultivates compassion.$en$,
  "categoryEn"   = $en$Meditation$en$
WHERE id = 38;

UPDATE "Definition" SET
  "termEn"       = $en$Nidra$en$,
  "definitionEn" = $en$Yoga Nidra, or "yogic sleep": a state of consciousness between waking and sleep, cultivated through a systematic rotation of awareness through the body. The practice induces deep relaxation while maintaining a light awareness, supporting regeneration and integration.$en$,
  "categoryEn"   = $en$Meditation$en$
WHERE id = 39;

UPDATE "Definition" SET
  "termEn"       = $en$Advaita Vedanta$en$,
  "definitionEn" = $en$A Hindu philosophical school of non-duality founded on the teachings of Adi Shankara. It holds that individual consciousness (Atman) is identical to universal consciousness (Brahman) — the apparent duality between self and world is maya (illusion).$en$,
  "categoryEn"   = $en$Philosophy$en$
WHERE id = 40;

UPDATE "Definition" SET
  "termEn"       = $en$Maya$en$,
  "definitionEn" = $en$Illusion, or the cosmic veiling power that makes the world appear as a separate, independent reality. In Advaita Vedanta, maya is not a denial of the world but a recognition that our ordinary perception is incomplete.$en$,
  "categoryEn"   = $en$Philosophy$en$
WHERE id = 41;

UPDATE "Definition" SET
  "termEn"       = $en$Atman$en$,
  "definitionEn" = $en$The Self, or individual consciousness, in Hindu philosophy. According to Advaita Vedanta, Atman is identical to Brahman (universal consciousness). Its direct realisation is liberation (moksha) from the cycle of rebirths.$en$,
  "categoryEn"   = $en$Philosophy$en$
WHERE id = 42;

UPDATE "Definition" SET
  "termEn"       = $en$Brahman$en$,
  "definitionEn" = $en$Ultimate reality — absolute, infinite consciousness — in Hindu philosophy. Brahman is without form, without attributes, without limit; it is the source and the substrate of all existence. Its direct understanding is the goal of the Vedantic spiritual quest.$en$,
  "categoryEn"   = $en$Philosophy$en$
WHERE id = 43;

UPDATE "Definition" SET
  "termEn"       = $en$Moksha$en$,
  "definitionEn" = $en$Spiritual liberation or emancipation, the supreme aim of life in the Hindu traditions. It refers to release from the cycle of births and deaths (samsara), attained through realising the true nature of the self and its identity with Brahman.$en$,
  "categoryEn"   = $en$Philosophy$en$
WHERE id = 44;

COMMIT;

-- Vérif rapide (doit renvoyer 0 partout si tout le contenu publié est traduit) :
--   SELECT count(*) FROM "Post"       WHERE "titleEn" IS NULL;
--   SELECT count(*) FROM "Tutorial"   WHERE "titleEn" IS NULL;
--   SELECT count(*) FROM "Definition" WHERE "definitionEn" IS NULL;
