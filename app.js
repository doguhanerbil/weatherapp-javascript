    const apiKey = "15c73fb3c0bddfde497dae1ad089185b";
    const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";

    const searchBox = document.querySelector(".search input");
    const searchBtn = document.querySelector(".search button");
    const weatherIcon = document.querySelector(".weather-icon");
    const recentList = document.querySelector(".recent-list"); // son aramaların gösterileceği liste
    let recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];// local storage kullanılarak recentsearches keyini almasını sağladım eğer daha önce arama yapılmamışsa boş dizi olarak başlar.
    const minCharacters = 2; // searchbox yerine en az 2 karakter girilmesi için oluşturulan kontrol için değişken


     function checkWeather(city) {

        if(recentSearches.some(recent => JSON.parse(recent).city.toLowerCase() === city.toLowerCase())) {
            showAlert("This city is already in the recent searches","error");
            return;
            // daha önce aranan şehir listede varsa kullanıcıya uyarı mesaju gösterir küçük harfle de uyarlı olması için öyle bir kural yazdım
        }


        fetch(apiUrl + city + `&appid=${apiKey}`)
            .then(response => {
                if(response.status == 404){
                showAlert("The city you entered that not included","error");
                document.querySelector(".error").style.display = "block";
                document.querySelector(".weather").style.display = "block";
                document.querySelector(".recent-searches").style.display = "block";

                } else {
                return response.json();
            }
        })
        .then(data => {
            

            if(data && data.main && data.weather) { //eğer apiden gelen veri başarılı ve eksizsizse aşağıdaki verileri güncelleme

                document.querySelector(".city").innerHTML = data.name;
                document.querySelector(".temp").innerHTML = Math.round(data.main.temp)+ "°C";
                document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
                document.querySelector(".wind").innerHTML = data.wind.speed + " km/h";
        
                if(data.weather[0].main == "Clouds") {
                    weatherIcon.src = "images/clouds.png";       //Hava durumu ikonunu güncelleme
                } else if(data.weather[0].main == "Clear") {
                    weatherIcon.src = "images/clear.png";
                } else if(data.weather[0].main == "Rain") {
                    weatherIcon.src = "images/rain.png";
                } else if(data.weather[0].main == "Drizzle") {
                    weatherIcon.src = "images/drizzle.png";
                } else if(data.weather[0].main == "Mist") {
                    weatherIcon.src = "images/mist.png";
                }
        
                document.querySelector(".weather").style.display = "block";
                document.querySelector(".error").style.display = "none";
                document.querySelector(".recent-searches").style.display = "block";

                updateRecentSearches(data.name,Math.round(data.main.temp),data.wind.speed,data.main.humidity,data.weather[0].main);
            } 
        })
        .catch(error => { //request sırasında oluşabilecek hataları yakalar ve konsola hata mesajı yazar.
            console.log("Error fetching data",error);
            showAlert("An error occured while fetching the weather data");
        });

    }


     // bu fonksiyon kullanıcı tarafından girilen şehire göre hava durumu bilgisini almak için apiye istek atar
        //eğer başarılı olursa alınan verileri ekranda gösterir başarısız olursa hata mesajı gönderilir

    function updateRecentSearches(city,temp,wind,humidity,weatherCondition) { //aramayı güncelleme ile alakalı fonksiyon oluşturdum
        const citySearching = {
            city,
            temp: temp + "°C",
            wind: wind + " km/h",
            humidity: humidity + "%",
            weatherCondition: weatherCondition
        }; //bu nesne kullanıcı tarafından aranan şehre ait bilgileri içerir

        if(recentSearches.some(recent => JSON.parse(recent).city.toLowerCase() === city.toLowerCase())) {
            showAlert("This city is already in the recent searches","error");
            return;
            // daha önce aranan şehir listede varsa kullanıcıya uyarı mesaju gösterir küçük harfle de uyarlı olması için öyle bir kural yazdım
        }
       
        recentSearches.push(JSON.stringify(citySearching));
        
        if(recentSearches.length > 3) {
            recentSearches.shift();
        }
        localStorage.setItem('recentSearches', JSON.stringify(recentSearches)); //localstorage da setitem ile gönderilen şehirlerin tutulmasını sağlıyorum
        displayRecentCities(); // burda da fonksiyonun içinde güncel şehirleri gösterme fonksiyonunu çağırıyorum.
        showAlert("weather data added to recent searches", "success"); // şehir eklendiği zamanda success uyarısı veriyorum
        // Bu fonksiyon kullanıcının aradığı şehri sıcaklık rüzgar hızı nem ile birlikte son arama listesine ekler
        // displayRecentCities fonksiyonunu çağırarak son aramaları günceller.
        
    }

    function displayRecentCities() {
       recentList.innerHTML = ""; //listeyi innerhtml aracılığıyla temizledim
       const recentSearchesToDisplay = recentSearches.slice(-3); //normalde 3 ten fazla şehir girilince listeden silmesi lazımdı ancak localstorage gösterdiği için ekranada veriyor ondan dolayı listeye 3 ten fazla şehirde ekleniyor bundan dolayı slice metoduyla son 3 elemanı aldım.
       recentSearchesToDisplay.forEach(cityJSON => {
        let cityData = JSON.parse(cityJSON); //JSON formatındaki şehir verisini javscript nesnesine dönüştürdüö
        let cityCard = document.createElement("div"); //cityCard adında bir div oluşturdum bu da listede aranan şehirleri carda dönüştürür.
        cityCard.classList.add("card");

        

        let weatherIconSrc = "";
        if(cityData.weatherCondition === ("Clouds")) {
            weatherIconSrc = "images/clouds.png";
        } else if(cityData.weatherCondition === ("Clear")) {
            weatherIconSrc = "images/clear.png";
        } else if(cityData.weatherCondition === ("Rain")) {
            weatherIconSrc = "images/rain.png";
        } else if(cityData.weatherCondition === ("Drizzle")) {
            weatherIconSrc = "images/drizzle.png";
        } else if(cityData.weatherCondition ===("Mist")) {
            weatherIconSrc = "images/mist.png";
        }
        cityCard.innerHTML = ` 
        <img src="${weatherIconSrc}" class="recent-weather-icon">
        <div class="city-details">
        <h3>${cityData.city}</h3>
        <p>${cityData.temp}</p>
        <p>${cityData.wind}</p>
        <p>${cityData.humidity + " " + "Humidity"}</p>
        </div>
        `; //citycard tanımlamıştım yukarıda bu da citycardın içini belirlemek için yazdım
        recentList.appendChild(cityCard); // oluşturduğum city listi asıl liste olan recentliste ekledim.
        
       });
       // bu fonksiyonda ise ilk başta listeyi temizler ve recentSearches dizisindeki herbir şehir için bir liste ögesi ekler ve bu eklediği ögeleri recentListe ekler
                document.querySelector(".weather").style.display = "block";
                document.querySelector(".error").style.display = "none";
                document.querySelector(".recent-searches").style.display = "block";

    }
    window.addEventListener('load', () => { //load ekledim sayfa yenilendiği zaman sayfa uçmasın aynı şekilde kalsın diye
        displayRecentCities(); //sayfa yenilendiği zaman display fonksiyonunu çağırıyorum
        if(recentSearches.length > 0) {
            const lastCityData = JSON.parse(recentSearches[recentSearches.length -1]); // bu da sayfa yenilendiğinde default bir şehir vardı her zaman onu getiriyordu bende en son aranan şehrin bilgilerini almak için yazdım bunu

            document.querySelector(".city").innerHTML = lastCityData.city;
            document.querySelector(".temp").innerHTML = lastCityData.temp;
            document.querySelector(".wind").innerHTML = lastCityData.wind;
            document.querySelector(".humidity").innerHTML = lastCityData.humidity;

        let weatherIconSrc = "";
        if(lastCityData.weatherCondition === "Clouds") {
            weatherIconSrc = "images/clouds.png";
        } else if(lastCityData.weatherCondition === "Clear") {
            weatherIconSrc = "images/clear.png";
        } else if(lastCityData.weatherCondition === "Rain") {
            weatherIconSrc = "images/rain.png";
        } else if(lastCityData.weatherCondition === "Drizzle") {
            weatherIconSrc = "images/drizzle.png";
        } else if(lastCityData.weatherCondition === "Mist") {
            weatherIconSrc = "images/mist.png";
        }

        document.querySelector(".weather-icon").src = weatherIconSrc;

        document.querySelector(".weather").style.display = "block";
        document.querySelector(".error").style.display = "none";
        document.querySelector(".recent-searches").style.display = "block";
        }
    })

    function showAlert(message, type) {
        const alert = document.querySelector(".alert");
        alert.textContent = message;
        alert.className = `alert ${type}`;
        alert.style.display = "block";
        setTimeout(() => {
            alert.style.display = "none";
        },3000);
    } // Bu fonksiyon hata durumunda alert oluşmasını sağlıyor.

    searchBox.addEventListener("keypress", (event) => {
        if(event.key === 'Enter') {
            if(searchBox.value.length <= minCharacters) {
                showAlert(`Minimum ${minCharacters} characters allowed`,"error");
            } else {
                checkWeather(searchBox.value);
                searchBox.value = "";
            }
        }
    })
    searchBtn.addEventListener("click", () => {
        if(searchBox.value.length <= minCharacters) {
            showAlert(`Minimum ${minCharacters} characters allowed`,"error");
        } else {
            checkWeather(searchBox.value);
            searchBox.value = "";
        }
    })
    searchBtn.addEventListener("click", () => {

        checkWeather(searchBox.value);
        searchBox.value = "";

    })
                
    

//sayfayı yenilediğimizde veriler uçmasın(localstorage)

//alertte ortak olan successte yeşil errorda kırmızı arka plan color aynı

// Bonus : recentsearch listi başka bi html dosyasında yapmak gerekiyor. 

