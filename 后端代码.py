from flask import Flask,request
import requests
import uuid
import pymysql
import datetime
import random,math
import time
import json

from DBUtils.PooledDB import PooledDB

config = {
    'host':'121.40.34.152',
    'port':3306,
    'database':'vegetable',
    'user':'root',
    'password':'cyc123456',
    'charset':'utf8',
    'ping':1
}


# db = pymysql.connect(host="121.40.34.152", user="root", password="cyc123456",db="vegetable",port=3306)
db_pool = PooledDB(pymysql,**config)

# 以字典形式显示，方便json传输
# cur = db.cursor(cursor=pymysql.cursors.DictCursor)


# 用户登录
# 返回用户的id
def userLog(session_key,openid):
    conn = db_pool.connection()
    cur = conn.cursor(cursor=pymysql.cursors.DictCursor)

    sql = 'select * from user where openid = "{}"'.format(openid)
    result_num = cur.execute(sql)

    conn.close()
    
    # 如果没找到，则返回0，说明是第一次登录
    if result_num == 0:
        return -1
    # 如果有，则说明用户不是第一次使用，已经创建过账户了
    else:
        data = cur.fetchone()
        return data['id']

# 用户创建
# 返回用户的id
def userCreate(session_key, openid):
    id = uuid.uuid1()
    conn = db_pool.connection()
    cur = conn.cursor(cursor=pymysql.cursors.DictCursor)

    sql = 'insert into user(id,openid,session_key) value ("{}","{}","{}")'.format(id,openid,session_key)
    cur.execute(sql)
    
    conn.commit()

    conn.close()
    return id


# 更新地址
def updateAddress(id,pname,cityname,adname):

    conn = db_pool.connection()
    cur = conn.cursor(cursor=pymysql.cursors.DictCursor)

    sql = 'update user set pname = "{}", cityname = "{}", adname = "{}" where id = "{}"'.format(pname,cityname,adname,id)
    
    try:
        
        cur.execute(sql)
        
        conn.commit()
        return "success"
    except:
        conn.rollback()
        return "rollback"
    finally:
        conn.close()

# 老用户获取地址
def getAddress(id):

    conn = db_pool.connection()
    cur = conn.cursor(cursor=pymysql.cursors.DictCursor)

    sql = 'select * from user where id = "{}"'.format(id)
    cur.execute(sql)
    
    data = cur.fetchone()

    conn.close()

    result = {
        "pname":"",
        "cityname":"",
        "adname":"",
    }
    result["pname"] = data["pname"]
    result["cityname"] = data["cityname"]
    result["adname"] = data["adname"]
    return result

# 输入 id   collectName
# 加入收藏
def addCollect(id, collectName):

    conn = db_pool.connection()
    cur = conn.cursor(cursor=pymysql.cursors.DictCursor)

    sql = 'select * from collect where (user_id="{}" and collect_name="{}")'.format(id, collectName)
    result_num = cur.execute(sql)
    
    # 如果没有加入过，就新建记录
    if result_num == 0:
        
        sql = 'insert into collect(user_id, collect_name) value ("{}","{}")'.format(id, collectName)
        try:
            cur.execute(sql)
            
            conn.commit()
        except:
            conn.rollback()
        finally:
            conn.close()
    # 如果曾经添加过，就把之前的is_deleted标识符改回来
    else:
        
        sql = 'update collect set is_deleted = 0 where (user_id = "{}" and collect_name = "{}")'.format(id, collectName)
        try:
            cur.execute(sql)
            
            conn.commit()
        except:
            conn.rollback()
        finally:
            conn.close()


# 读取用户的收藏夹
def readCollect(id):

    conn = db_pool.connection()
    cur = conn.cursor(cursor=pymysql.cursors.DictCursor)

    sql = 'select collect_name from collect where (user_id = "{}" and is_deleted = 0)'.format(id)
    result_num = cur.execute(sql)

    conn.close()
    
    if result_num == 0:
        return -1
    else:
        result = cur.fetchall()
    names = []
    for i in result:
        names.append(i["collect_name"])
    print(names)
    return names

# 用户取消收藏
def deleteCollect(id, collect_name):

    conn = db_pool.connection()
    cur = conn.cursor(cursor=pymysql.cursors.DictCursor)

    sql = 'update collect set is_deleted = 1 where (user_id = "{}" and collect_name = "{}")'.format(id, collect_name)
    try:
        cur.execute(sql)
        
        conn.commit()
    except:
        conn.rollback()
    finally:
        conn.close()





# 检查查询出来的数据中,min_price 和 max_price 是否为0 或者为 null,
# 返回的是datas
def checkData(datas):
    for data in datas:
        # 把数据中的价格转换为数字
        data["average_price"] = float(data["average_price"])
        if (data["min_price"] == (0 or None) or data["max_price"] == (0 or None)):
            # 最低价就是平均价的0.8倍
            # 最高价就是平均价的1.2倍
            # 并精确到小数点后面1位
            data["min_price"] = round(float(data["average_price"]) * 0.8, 1)
            data["max_price"] = round(float(data["average_price"]) * 1.2, 1)
        else:
            data["min_price"] = float(data["min_price"])
            data["max_price"] = float(data["max_price"])
    return datas

# datas内的多个数据平均价格取平均值，最低价取最低的，最高价取最高的
def averageData(datas):
    
    mindata = datetime.date.today() - datas[0]["date"]
    index = 0
    for i in range(len(datas)):
        x = datetime.date.today() - datas[i]["date"]
        if x < mindata:
            index = i
    # 最新更新的一家市场的数据作为基准值
    price = float(datas[i]["average_price"])

    min_price = []
    max_price = []
    average = 0
    trend = 0
    for data in datas:
        average = average + float(data["average_price"])
        # trend = trend + float(data["trend"])
        min_price.append(float(data["min_price"]))
        max_price.append(float(data["max_price"]))
    # 求平均值，并换成斤位单位
    average = round(average * 0.5 / len(datas), 2)
    # 求最低价，并换成斤位单位
    lowest = round(min(min_price) * 0.5, 2)
    # 求最高价，并换成斤位单位
    highest = round(max(max_price), 2)
    # # 求趋势平均值
    # trend = round(trend / len(datas),1)
    # 直接套用datas[0]的壳子
    datas[0]["average_price"] = average
    datas[0]["min_price"] = lowest
    datas[0]["max_price"] = highest
    # datas[0]["trend"] = trend
    return datas[0]

def searchDataInArea(vegetable,adname):
    conn = db_pool.connection()
    cur = conn.cursor(cursor=pymysql.cursors.DictCursor)

    # 从区里找蔬菜，按时间排序，15天内
    
    sql = 'select * from vegetable_price, market where(vegetable_price.market_name=market.market_name and market.adname="{}" and vegetable_price.name="{}" and date_sub(curdate(),interval 15 day)<=vegetable_price.date) order by vegetable_price.date desc'.format(adname,vegetable)
    result_num = cur.execute(sql)

    conn.close()

    # 如果没找到，返回-1
    if result_num == 0:
        return -1
    else:
        data = cur.fetchall()
    datas = checkData(data)
    return averageData(datas)

def searchDataInCity(vegetable,cityname):
    conn = db_pool.connection()
    cur = conn.cursor(cursor=pymysql.cursors.DictCursor)
    # 从市里找蔬菜,按时间倒序,15天内
    
    sql = 'select * from vegetable_price, market where(vegetable_price.market_name=market.market_name and market.cityname="{}" and vegetable_price.name="{}" and date_sub(curdate(),interval 15 day)<=vegetable_price.date) order by vegetable_price.date desc'.format(cityname,vegetable)
    result_num = cur.execute(sql)
    
    conn.close()
    # 如果没找到，返回-1
    if result_num == 0:
        return -1
    else:
        data = cur.fetchall()
    datas = checkData(data)
    return averageData(datas) 

def searchDataInProvince(vegetable,pname):
    conn = db_pool.connection()
    cur = conn.cursor(cursor=pymysql.cursors.DictCursor)
    # 从省里找蔬菜,按时间倒序,15天内
    
    sql = 'select * from vegetable_price, market where(vegetable_price.market_name=market.market_name and market.pname="{}" and vegetable_price.name="{}" and date_sub(curdate(),interval 15 day)<=vegetable_price.date) order by vegetable_price.date desc'.format(pname,vegetable)
    result_num = cur.execute(sql)
    
    conn.close()
    # 如果没找到，返回-1
    if result_num == 0:
        return -1
    else:
        data = cur.fetchall()
    datas = checkData(data)
    return averageData(datas)

def searchDataInCountry(vegetable):
    conn = db_pool.connection()
    cur = conn.cursor(cursor=pymysql.cursors.DictCursor)
    # 从全部数据中找蔬菜，选择最新的一个
    
    sql = 'select * from vegetable_price where(vegetable_price.name="{}") order by vegetable_price.date desc limit 2'.format(vegetable)
    result_num = cur.execute(sql)
    
    conn.close()
    # 如果没找到，返回-1
    if result_num == 0:
        return -1
    else:
        data = cur.fetchall()
    datas = checkData(data)
    return averageData(datas)


# datas
    """
    {'id': 798829, 
    'date': datetime.date(2020, 1, 19), 
    'name': '土豆', 
    'average_price': 1.3, 
    'min_price': 1.0, 
    'max_price': 1.6, 
    'market_name': '浙江宁波市蔬菜副食品批发交易市场', 
    'market.id': 227, 
    'market.market_name': 
    '浙江宁波市蔬菜副食品批发交易市场', 
    'pname': '浙江省', 
    'cityname': '宁波市', 
    'adname': '鄞州区', 
    'longitude': '121.553779', 
    'latitude': '29.841555', 
    'trend': 0.0}
    """
# 查询 区，市，省，国
# 参数：
#       vegetable 蔬菜名
#       adname 地区名字
#       cityname 城市名字
#       pname 省份名字
def searchData(vegetable,adname,cityname,pname):
    starttime = time.perf_counter()
    a = searchDataInArea(vegetable,adname)# 查询区
    endtime = time.perf_counter()
    print("区查询时间：")
    print(endtime - starttime)
    if a == -1:
        starttime = time.perf_counter()
        b = searchDataInCity(vegetable,cityname)# 查询市
        endtime = time.perf_counter()
        print("市查询时间：")
        print(endtime - starttime)
        if b == -1:
            starttime = time.perf_counter()
            c = searchDataInProvince(vegetable,pname)# 查询省
            endtime = time.perf_counter()
            print("省查询时间：")
            print(endtime - starttime)
            if c == -1:
                starttime = time.perf_counter()
                d = searchDataInCountry(vegetable)# 国查询
                endtime = time.perf_counter()
                print("国查询时间：")
                print(endtime - starttime)
                if d == -1:
                    return "Not Found"
                else:
                    return d
            else:
                return c
        else:
            return b
    else:
        return a

# 查询食材挑选方法
def searchSuggest(name):
    conn = db_pool.connection()
    cur = conn.cursor(cursor=pymysql.cursors.DictCursor)

    sql = 'select method from choose where name = "{}"'.format(name)
    result_num = cur.execute(sql)

    conn.close()
    
    # 如果没找到，则返回-1
    if result_num == 0:
        return -1
    # 
    else:
        data = cur.fetchone()
        return data




app = Flask(__name__)

# 功能：根据名字返回食材的挑选方法
# 传入参数：
#   name:""
# 传出参数：
#   json_data={
#       "method":"....."
#       }
#  
@app.route("/searchSuggest",methods=["GET","POST"])
def SearchSuggest():
    data = request.get_data()
    name = request.args.get("name")
    result = searchSuggest(name)
    if result == -1:
        return "Not Found"
    else:
        json_data = result
        return json_data



# 功能：读取用户的收藏夹
# 传入参数：
#   id:""
# 传出参数：
#   json_data={
#       0:"土豆",
#       1:"番茄",
#       ......
#       }
#   
@app.route("/readCollect",methods=["GET","POST"])
def ReadCollect():

    

    data = request.get_data()
    id = request.args.get("id")
    names = readCollect(id)
    json_data = {}
    j = 0
    if names == -1:
        return 'NoData'
    for i in names:
        json_data[j] = i
        j=j+1
    return json_data

# 功能：用户取消收藏
# 传入参数：
#   id:""，
#   collect_name:"",# 收藏的蔬菜名字
# 传出参数：
#   
@app.route("/deleteCollect",methods=["GET","POST"])
def DeleteCollect():

    

    data = request.get_data()
    id = request.args.get("id")
    collect_name = request.args.get("collect_name")
    deleteCollect(id,collect_name)
    return "success deleteCollect"

# 功能：加入用户的收藏夹
# 传入参数：
#   id:""，
#   collect_name:"",# 收藏的蔬菜名字
# 传出参数：
#   
@app.route("/addCollect",methods=["GET","POST"])
def AddCollect():

    

    data = request.get_data()
    id = request.args.get("id")
    collect_name = request.args.get("collect_name")
    addCollect(id, collect_name)
    return "success addCollect"


# 功能：查询蔬菜
# 传入参数：
#   "id":'',#用户的唯一标识
#   "pname":"",# 省份
#   "cityname":"",# 市
#   "adname":"",# 地区
#   "vegetable":"",# 蔬菜名字
# 传出参数：
    """
    {'id': 798829, 
    'date': datetime.date(2020, 1, 19), 
    'name': '土豆', 
    'average_price': 1.3, 
    'min_price': 1.0, 
    'max_price': 1.6, 
    'market_name': '浙江宁波市蔬菜副食品批发交易市场', 
    'market.id': 227, 
    'market.market_name': 
    '浙江宁波市蔬菜副食品批发交易市场', 
    'pname': '浙江省', 
    'cityname': '宁波市', 
    'adname': '鄞州区', 
    'longitude': '121.553779', 
    'latitude': '29.841555', 
    }
    """
# 
@app.route("/search",methods=["GET","POST"])
def SearchData():

    

    data = request.get_data()
    id = request.args.get("id")
    pname = request.args.get("pname")
    cityname = request.args.get("cityname")
    adname = request.args.get("adname")
    vegetable = request.args.get("vegetable")
    json_data = searchData(vegetable,adname,cityname,pname)
    if json_data == "Not Found":
        return json_data
    else:
        json_data["id"] = id
        return json_data

# 功能：更新地址
# 传入参数：
#   "id":'',#用户的唯一标识
#   "pname":"",# 省份
#   "cityname":"",# 市
#   "adname":"",# 地区
# 传出参数：
#   json_data{
#       "pname":"",# 省份
#       "cityname":"",# 市
#       "adname":"",# 地区
#   }
@app.route("/updateAddress",methods=['GET','POST'])
def UpdateAddress():

    

    data = request.get_data()
    id = request.args.get("id")
    pname = request.args.get("pname")
    cityname = request.args.get("cityname")
    adname = request.args.get("adname")
    s = updateAddress(id,pname,cityname,adname)
    json_data = {
        "pname":pname,# 省份
        "cityname":cityname,# 市
        "adname":adname,# 地区
    }
    if s == "rollback":
        return "rollback"
    
    return json_data

# 功能：老用户获取地址
# 传入参数：
#   id:'',#用户的唯一标识
# 传出参数：
#   json_data{
#       "pname":"",# 省份
#       "cityname":"",# 市
#       "adname":"",# 地区
#   }
@app.route("/getAddress",methods=['GET','POST'])
def GetAddress():

    

    data = request.get_data()
    id = request.args.get("id")
    json_data = getAddress(id)
    return json_data





# 功能：登录
# 传入参数：
#   code
# 传出参数：
#   json_data{
#       "id":'',#用户的唯一标识
#       "is_new": int ,# 是否为新用户，1为新用户，0不是
#   }
@app.route("/Login",methods=['GET','POST'])
def Login():

    data = request.get_data()
    print(data)

    code = request.args.get("code")
    print(code)

    appId = "wx5f41dd3998574dc7"
    secret = "9d4af28ba5c3792bc0971855198d67af"
    url = "https://api.weixin.qq.com/sns/jscode2session?appid={}&secret={}&js_code={}&grant_type=authorization_code".format(appId,secret,code)
    result = requests.get(url)
    # print(url)
    print(result.status_code)
    print(result.text)
    #{"session_key":"IP7JTxqeEBblJ+Ja1Lkf5A==","openid":"oyitX42mJ19JLVowER6Tp3LPeDd0"}
    temp = json.loads(result.text)
    session_key = temp["session_key"]
    openid = temp["openid"]

    json_data = {
        "id":"",
        "is_new":0,
    }
    id = userLog(session_key,openid)
    if id == -1:
        json_data["is_new"] = 1
        json_data["id"] = userCreate(session_key, openid)
    else:
        json_data["id"] = id
    return json_data






















if __name__ == '__main__':
    app.run(host='localhost',port=5000,debug=True)