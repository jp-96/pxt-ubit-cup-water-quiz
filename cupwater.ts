
/**
* Use this file to define custom functions and blocks.
* Read more at https://makecode.microbit.org/blocks/custom
*/

// enum MyEnum {
//     //% block="one"
//     One,
//     //% block="two"
//     Two
// }

/**
 * Cupwater blocks
 * icon: a Unicode identifier for an icon from the Font Awesome icon set.
 *       http://fontawesome.io/icons
 */
//% weight=100 color=#696969 icon="\uf1b2"
namespace cupwater {

    // ================
    // [###] ステート
    // ================
    // 【初期化】
    // [000] 0-初期化
    //
    // 【アイドル】
    // [100] 1-アイドル
    //
    // 【ペアリング】
    // [210] 2.1-ペアリング::相手待ち
    // [220] 2.2-ペアリング::ペア確定
    //
    // 【授受】
    // [311] 3.1.1-授受::方向処理::傾き待ち
    // [312] 3.1.2-授受::方向処理::送信者候補
    // [313] 3.1.3-授受::方向処理::受信者候補
    // [314] 3.1.4-授受::方向処理::送信者衝突
    //
    // [321] 3.2.1-授受::受信者::受信待ち
    // [322] 3.2.2-授受::受信者::受信完了
    // [323] 3.2.3-授受::受信者::受信加算
    //
    // [331] 3.3.1-授受::送信者::送信待ち
    // [332] 3.3.2-授受::送信者::送信完了
    // [333] 3.3.3-授受::送信者::送信減算
    //
    // 【タイムアウト】
    // [400] 4-タイムアウト

    /**
     * ステート
     */
    enum RadioState {
        /**
         * [000] 0-初期化
         */
        RS000Init,
        /**
         * [100] 1-アイドル
         */
        RS100Idle,
        /**
         * [210] 2.1-ペアリング::相手待ち
         */
        RS210Pairing,
        /**
         * [220] 2.2-ペアリング::ペア確定
         */
        RS220Paired,
        /**
         * [311] 3.1.1-授受::方向処理::傾き待ち
         */
        RS311Tilting,
        /**
         * [312] 3.1.2-授受::方向処理::送信者候補
         */
        RS312WillSender,
        /**
         * [313] 3.1.3-授受::方向処理::受信者候補
         */
        RS313WillReceiver,
        /**
         * [314] 3.1.4-授受::方向処理::送信者衝突
         */
        RS314SenderCollision,
        /**
         * [321] 3.2.1-授受::受信者::受信待ち
         */
        RS321Receiving,
        /**
         * [322] 3.2.2-授受::受信者::受信完了
         */
        RS322Received,
        /**
         * [323] 3.2.3-授受::受信者::受信加算
         */
        RS323Add,
        /**
         * [331] 3.3.1-授受::送信者::送信待ち
         */
        RS331Sending,
        /**
         * [332] 3.3.2-授受::送信者::送信完了
         */
        RS332Send,
        /**
         * [333] 3.3.3-授受::送信者::送信減算
         */
        RS333Dec,
        /**
         * [400] 4-タイムアウト
         */
        RS400Timeouted,
    }

    let state: RadioState = RadioState.RS000Init

    /**
     * 状態遷移: [000] 0-初期化
     * ※ そのまま、アイドルへ遷移
     */
    function toInit(capacity: number, water: number): void {
        basic.showString("A")
        state = RadioState.RS000Init
        // entry/ リセット
        cupCapacity = capacity
        if (water > capacity) {
            cupWater = capacity
        } else {
            cupWater = water
        }
        // アイドルへ
        toIdle()
    }

    /**
     * 状態遷移: [100] 1-アイドル
     */
    function toIdle(): void {
        basic.showString("B")
        state = RadioState.RS100Idle
        // entry/ 表示
        basic.showNumber(cupWater)
    }

    /**
     * 状態遷移: [210] 2.1-ペアリング::相手待ち
     */
    function toPairing(): void {
        basic.showString("C")
        state = RadioState.RS210Pairing
        // entry/ [SN]"moved"を送信
        timeoutCounter = 10000 // ms
        radio.sendString("moved")
    }

    /**
     * 状態遷移: [220] 2.2-ペアリング::ペア確定
     * @param serialNumber 送信元のシリアルナンバー
     */
    function toPaired(serialNumber: number): void {
        basic.showString("D")
        state = RadioState.RS220Paired
        // 送信元のシリアルナンバーを保持
        lastSerialNumber = serialNumber
        // entry/ [SN]"moved"を送信
        radio.sendString("moved")

        // do/ [SN]"pairing"=(相手のSN)を送受信
        radio.sendValue("pairing", lastSerialNumber)
    }

    /**
     * 状態遷移: [311] 3.1.1-授受::方向処理::傾き待ち
     */
    function toTilting(): void {
        basic.showString("E")
        state = RadioState.RS311Tilting
    }

    /**
     * 状態遷移: [312] 3.1.2-授受::方向処理::送信者候補
     */
    function toWillSender(): void {
        basic.showString("F")
        state = RadioState.RS312WillSender
        // entry/ [SN]"sender"を送信
        radio.sendString("sender")

    }

    /**
     * 状態遷移: [313] 3.1.3-授受::方向処理::受信者候補
     */
    function toWillReceiver(): void {
        basic.showString("G")
        state = RadioState.RS313WillReceiver
        // entry/ [SN]"receiver"を送信
        radio.sendString("receiver")
    }

    /**
     * 状態遷移: [314] 3.1.4-授受::方向処理::送信者衝突
     * ※ そのまま、傾き待ちへ遷移
     */
    function toSenderCollision(): void {
        basic.showString("H")
        state = RadioState.RS314SenderCollision
        // entry/ [SN]"NAK"を送信
        radio.sendString("NAK")
        // 傾き待ちへ
        toTilting()
    }

    /**
     * 状態遷移: [321] 3.2.1-授受::受信者::受信待ち
     */
    function toReceiving(): void {
        basic.showString("J")
        state = RadioState.RS321Receiving
        // [SN]"free"=(受け取り可能容量)を送信
        radio.sendValue("free", cupCapacity - cupWater)
    }

    /**
     * 状態遷移: [322] 3.2.2-授受::受信者::受信完了
     */
    /**
     * 
     * @param value 受け渡し量
     */
    function toReceived(value: number): void {
        basic.showString("K")
        state = RadioState.RS322Received
        sharedWater = value
        // entry/ [SN]"ACK"を送信
        radio.sendString("ACK")
    }

    /**
     * 状態遷移: [323] 3.2.3-授受::受信者::受信加算
     * ※ そのまま、アイドルへ遷移
     */
    function toAdd(): void {
        basic.showString("L")
        state = RadioState.RS323Add
        // entry/ 加算処理
        cupWater = cupWater + sharedWater
        sharedWater = 0
        // アイドルへ
        toIdle()
    }

    /**
     * 状態遷移: [331] 3.3.1-授受::送信者::送信待ち
     */
    function toSending(): void {
        basic.showString("M")
        state = RadioState.RS331Sending
        // entry/ [SN]"ACK"を送信
        radio.sendString("ACK")
    }

    /**
     * 状態遷移: [332] 3.3.2-授受::送信者::送信完了
     * @param value 空き容量
     */
    function toSend(value: number): void {
        basic.showString("N")
        state = RadioState.RS332Send
        // entry/ [SN]"share"=(受け渡し量)を送信
        if (value > cupWater) {
            sharedWater = cupWater
        } else {
            sharedWater = value
        }
        radio.sendValue("share", sharedWater)
    }

    /**
     * 状態遷移: [333] 3.3.3-授受::送信者::送信減算
     * ※ そのまま、アイドルへ遷移
     */
    function toDec(): void {
        basic.showString("P")
        state = RadioState.RS331Sending
        // entry/ [SN]"ACK"を送信
        radio.sendString("ACK")
        // entry/ 減算処理
        cupWater = cupWater - sharedWater
        sharedWater = 0
        // アイドルへ
        toIdle()
    }

    /**
     * 状態遷移: [400] 4-タイムアウト
     * ※ そのまま、アイドルへ遷移
     */
    function toTimeouted(): void {
        basic.showString("Q")
        state = RadioState.RS400Timeouted

        // アイドルへ
        toIdle()
    }

    /**
     * トリガー: 動いた 
     */
    function onTriggerMoved(): void {
        switch (state) {
            case RadioState.RS100Idle:
                // 相手待ちへ
                toPairing()
                break
            default:
                break
        }
    }

    /**
     * トリガー: [SN]"moved"を受信
     * 
     * @param serialNumber 送信元のシリアルナンバー
     */
    function onTriggerReceivedMoved(serialNumber: number): void {
        switch (state) {
            case RadioState.RS210Pairing:
                // ペア確定へ
                toPaired(serialNumber)
                break
            default:
                break
        }

    }

    /**
     * "pairing"受信において、自分と相手とのSNが一致するかどうか
     * @param value 相手がペアリングを期待するシリアルナンバー（自分のシリアルナンバー）
     * @param serialNumber 送信元のシリアルナンバー（相手のシリアルナンバー）
     * @returns 自分のシリアルナンバーと相手のシリアルナンバーとが一致した場合、真。それ以外の場合は、偽。
     */
    function compareParingSeralNumber(value: number, serialNumber: number): boolean {
        // 受信した"pairing"値が自分のシリアルナンバーで
        // その送信元が相手のシリアルナンバーかどうか
        return ((value == control.deviceSerialNumber()) && (serialNumber == lastSerialNumber))
    }

    /**
     * トリガー: 自分と相手とのSNが一致した"pairing"を受信
     */
    function onTriggerPairingCompleted(): void {
        switch (state) {
            case RadioState.RS220Paired:
                // 傾き待ちへ
                toTilting()
                break
            default:
                break
        }
    }

    /**
     * トリガー: 傾いた
     */
    function onTriggerTilted(): void {
        switch (state) {
            case RadioState.RS311Tilting:
                // 送信者候補へ
                toWillSender()
                break
            default:
                break
        }
    }

    /**
     * トリガー: [SN]"sender"を受信
     * @param serialNumber 送信元のシリアルナンバー（相手のシリアルナンバー）
     */
    function onTriggerReceivedSender(serialNumber: number): void {
        switch (state) {
            case RadioState.RS311Tilting:
                if (serialNumber == lastSerialNumber) {
                    // 受信者候補へ
                    toWillReceiver()
                }
                break
            case RadioState.RS312WillSender:
                // 方向衝突へ（そのまま、傾き待ちへ）
                toSenderCollision()
                break
            default:
                break
        }
    }

    /**
     * トリガー: [SN]"receiver"を受信
     * @param serialNumber 
     */
    function onTriggerReceivedReceiver(serialNumber: number): void {
        switch (state) {
            case RadioState.RS312WillSender:
                // 送信待ちへ（受け取り側）
                toSending()
                break
            default:
                break
        }
    }

    /**
     * トリガー: [SN]"ACK"を受信
     * @param serialNumber 
     */
    function onTriggerReceivedACK(serialNumber: number): void {
        switch (state) {
            case RadioState.RS313WillReceiver:
                // 受信待ちへ
                toReceiving()
                break
            case RadioState.RS322Received:
                // 受信加算へ
                toAdd()
            case RadioState.RS332Send:
                // 送信減算へ
                toDec()
            default:
                break
        }
    }

    /**
     * トリガー: [SN]"NAK"を受信
     * @param serialNumber 
     */
    function onTriggerReceivedNAK(serialNumber: number): void {
        switch (state) {
            case RadioState.RS312WillSender:
                // 傾き待ちへ
                toTilting()
                break
            default:
                break
        }
    }

    /**
     * トリガー: [SN]"free"=(空き容量)を受信
     * @param freeValue 空き容量
     */
    function onTriggerFree(freeValue: number): void {
        switch (state) {
            case RadioState.RS331Sending:
                // 送信完了へ
                toSend(freeValue)
                break
            default:
                break
        }
    }

    /**
     * トリガー: [SN]"share"=(空き容量)を受信
     * @param shareValue 受け渡し量
     */
    function onTriggerShare(shareValue: number): void {
        switch (state) {
            case RadioState.RS321Receiving:
                // 受信完了へ
                toReceived(shareValue)
                break
            default:
                break
        }
    }

    /**
     * トリガー: タイムアウト
     */
    function onTriggerTimeout(): void {
        switch (state) {
            case RadioState.RS000Init:
            case RadioState.RS100Idle:
            case RadioState.RS400Timeouted:
                break
            default:
            // タイムアウトへ
                toTimeouted()
                break
        }
    }

    /**
     * Radio 文字列受信
     */
    radio.onReceivedString(function (receivedString) {
        switch (receivedString) {
            case "moved":
                // [SN]"moved"を受信
                onTriggerReceivedMoved(radio.receivedPacket(RadioPacketProperty.SerialNumber))
                break
            case "sender":
                // [SN]"sender"を受信
                onTriggerReceivedSender(radio.receivedPacket(RadioPacketProperty.SerialNumber))
                break
            case "receiver":
                // [SN]"receiver"を受信
                onTriggerReceivedReceiver(radio.receivedPacket(RadioPacketProperty.SerialNumber))
                break
            case "ACK":
                // [SN]"ACK"を受信
                onTriggerReceivedACK(radio.receivedPacket(RadioPacketProperty.SerialNumber))
                break
            case "NAK":
                // [SN]"NAK"を受信
                onTriggerReceivedNAK(radio.receivedPacket(RadioPacketProperty.SerialNumber))
                break
            default:
                break
        }
    })

    /**
     * Radio 変数値受信
     */
    radio.onReceivedValue(function (name, value) {
        switch (name) {
            case "pairing":
                // [SN]"pairing"=(相手のSN)を送受信
                const serialNumber = radio.receivedPacket(RadioPacketProperty.SerialNumber)
                if (compareParingSeralNumber(value, serialNumber)) {
                    // 自分と相手とのSNが一致した"pairing"を受信
                    onTriggerPairingCompleted()
                }
                break
            case "free":
                // [SN]"free"=(空き容量)を受信
                onTriggerFree(value)
                break
            case "share":
                // [SN]"share"=(空き容量)を受信
                onTriggerShare(value)
                break
            default:
                break;
        }
    })

    /**
     * ジェスチャー(TiltLeft)
     */
    input.onGesture(Gesture.TiltLeft, function () {
        // 傾いた
        onTriggerTilted()
    })
    /**
     * ジェスチャー(TiltLeft)
     */
    input.onGesture(Gesture.TiltRight, function () {
        // 傾いた
        onTriggerTilted()
    })

    /**
     * ジェスチャー(動いた),タイムアウト
     */
    basic.forever(function () {
        const intervalTime = 100 // (ms)
        basic.pause(intervalTime)
        if (RadioState.RS100Idle == state) {
            if (1274 < input.acceleration(Dimension.Strength)) {
                // 動いた
                onTriggerMoved()
            }
        }
        if (timeoutCounter > 0) {
            timeoutCounter -= intervalTime
        } else {
            onTriggerTimeout()
        }
    })

    /**
     * リセット: 10L
     */
    input.onButtonPressed(Button.AB, function () {
        // start - 初期化-->アイドル
        toInit(10, 10)

    })

    /**
     * リセット: 7L
     */
    input.onButtonPressed(Button.A, function () {
        // start - 初期化-->アイドル
        toInit(7, 0)

    })

    /**
     * リセット: 3L
     */
    input.onButtonPressed(Button.B, function () {
        // start - 初期化-->アイドル
        toInit(3, 0)

    })

    let cupCapacity = 0
    let cupWater = 0
    let sharedWater = 0
    let lastSerialNumber = 0
    let timeoutCounter = 0
    radio.setGroup(1)
    radio.setTransmitSerialNumber(true)

    // start - 初期化-->アイドル
    toInit(10, 10)
}
